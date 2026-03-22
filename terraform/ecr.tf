resource "aws_ecr_repository" "ticketnova" {
  name                 = var.project_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }

  tags = {
    Name    = "${var.project_name}-ecr"
    Project = var.project_name
  }
}

output "ecr_repository_url" {
  value = aws_ecr_repository.ticketnova.repository_url
}
