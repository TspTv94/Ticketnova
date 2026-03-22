output "ecr_url" {
  description = "ECR Repository URL"
  value       = aws_ecr_repository.ticketnova.repository_url
}

output "app_ip" {
  description = "App Server Public IP"
  value       = aws_instance.app_server.public_ip
}

output "jenkins_ip" {
  description = "Jenkins Server Public IP"
  value       = aws_instance.jenkins_server.public_ip
}

output "app_url" {
  description = "TicketNova App URL"
  value       = "http://${aws_instance.app_server.public_ip}:3000"
}

output "jenkins_access" {
  description = "Jenkins URL"
  value       = "http://${aws_instance.jenkins_server.public_ip}:8080"
}
