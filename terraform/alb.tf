# ── Second Public Subnet (ALB needs 2 subnets) ───────────────
resource "aws_subnet" "public_subnet_2" {
  vpc_id                  = aws_vpc.ticketnova_vpc.id
  cidr_block              = "10.0.2.0/24"
  availability_zone       = "${var.aws_region}b"
  map_public_ip_on_launch = true

  tags = {
    Name = "${var.project_name}-public-subnet-2"
  }
}

resource "aws_route_table_association" "public_rta_2" {
  subnet_id      = aws_subnet.public_subnet_2.id
  route_table_id = aws_route_table.public_rt.id
}

# ── Security Group for ALB ───────────────────────────────────
resource "aws_security_group" "alb_sg" {
  name        = "${var.project_name}-alb-sg"
  description = "Security group for Application Load Balancer"
  vpc_id      = aws_vpc.ticketnova_vpc.id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-alb-sg"
  }
}

# ── Application Load Balancer ────────────────────────────────
resource "aws_lb" "ticketnova" {
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb_sg.id]
  subnets            = [
    aws_subnet.public_subnet.id,
    aws_subnet.public_subnet_2.id
  ]

  tags = {
    Name    = "${var.project_name}-alb"
    Project = var.project_name
  }
}

# ── Target Group ─────────────────────────────────────────────
resource "aws_lb_target_group" "ticketnova" {
  name        = "${var.project_name}-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = aws_vpc.ticketnova_vpc.id
  target_type = "ip"

  health_check {
    enabled             = true
    healthy_threshold   = 2
    unhealthy_threshold = 3
    timeout             = 10
    interval            = 30
    path                = "/health"
    matcher             = "200"
  }

  tags = {
    Name = "${var.project_name}-tg"
  }
}

# ── ALB Listener ─────────────────────────────────────────────
resource "aws_lb_listener" "ticketnova" {
  load_balancer_arn = aws_lb.ticketnova.arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ticketnova.arn
  }
}

# ── Output ALB DNS ────────────────────────────────────────────
output "app_load_balancer_url" {
  value       = "http://${aws_lb.ticketnova.dns_name}"
  description = "Application Load Balancer URL"
}

resource "aws_lb_listener" "ticketnova_https" {
  load_balancer_arn = aws_lb.ticketnova.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = "arn:aws:acm:ap-south-1:434748505869:certificate/eaf4f4d3-8dc8-4d93-bcc1-8fb206e8625b"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.ticketnova.arn
  }
}
