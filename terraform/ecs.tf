# ── ECS Cluster ─────────────────────────────────────────────
resource "aws_ecs_cluster" "ticketnova" {
  name = "${var.project_name}-cluster"

  tags = {
    Name    = "${var.project_name}-cluster"
    Project = var.project_name
  }
}

# ── IAM Role for ECS Task Execution ─────────────────────────
resource "aws_iam_role" "ecs_task_execution_role" {
  name = "${var.project_name}-ecs-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution_role_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy_attachment" "ecs_task_ecr_policy" {
  role       = aws_iam_role.ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
}

# ── CloudWatch Log Group ─────────────────────────────────────
resource "aws_cloudwatch_log_group" "ticketnova" {
  name              = "/ecs/${var.project_name}"
  retention_in_days = 7

  tags = {
    Project = var.project_name
  }
}

# ── ECS Task Definition ──────────────────────────────────────
resource "aws_ecs_task_definition" "ticketnova" {
  family                   = "${var.project_name}-task"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = "512"
  memory                   = "1024"
  execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn

  container_definitions = jsonencode([{
    name      = var.project_name
    image     = "${aws_ecr_repository.ticketnova.repository_url}:latest"
    essential = true

    portMappings = [{
      containerPort = 3000
      hostPort      = 3000
      protocol      = "tcp"
    }]

    environment = [
      { name = "NODE_ENV",   value = "production" },
      { name = "PORT",       value = "3000" },
      { name = "MONGO_URI",  value = var.mongo_uri }
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project_name}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = {
    Name    = "${var.project_name}-task"
    Project = var.project_name
  }
}

# ── Security Group for ECS ───────────────────────────────────
resource "aws_security_group" "ecs_sg" {
  name        = "${var.project_name}-ecs-sg"
  description = "Security group for ECS tasks"
  vpc_id      = aws_vpc.ticketnova_vpc.id

  ingress {
    from_port       = 3000
    to_port         = 3000
    protocol        = "tcp"
    security_groups = [aws_security_group.alb_sg.id]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ecs-sg"
  }
}

# ── ECS Service ──────────────────────────────────────────────
resource "aws_ecs_service" "ticketnova" {
  name            = "${var.project_name}-service"
  cluster         = aws_ecs_cluster.ticketnova.id
  task_definition = aws_ecs_task_definition.ticketnova.arn
  desired_count   = 1
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = [aws_subnet.public_subnet.id]
    security_groups  = [aws_security_group.ecs_sg.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.ticketnova.arn
    container_name   = var.project_name
    container_port   = 3000
  }

  depends_on = [
    aws_lb_listener.ticketnova,
    aws_iam_role_policy_attachment.ecs_task_execution_role_policy
  ]

  tags = {
    Name    = "${var.project_name}-service"
    Project = var.project_name
  }
}

# ── Outputs ──────────────────────────────────────────────────
output "ecs_cluster_name" {
  value = aws_ecs_cluster.ticketnova.name
}

output "ecs_service_name" {
  value = aws_ecs_service.ticketnova.name
}
