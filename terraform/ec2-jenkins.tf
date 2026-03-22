resource "aws_instance" "jenkins_server" {
  ami                         = "ami-095cc90aa5ddff518"
  instance_type               = var.jenkins_instance_type
  subnet_id                   = aws_subnet.public_subnet.id
  vpc_security_group_ids      = [aws_security_group.jenkins_sg.id]
  key_name                    = var.key_pair_name
  associate_public_ip_address = true

  user_data = <<-USERDATA
    #!/bin/bash
    apt update -y
    apt install -y docker.io git curl
    systemctl start docker
    systemctl enable docker
    usermod -aG docker ubuntu
  USERDATA

  lifecycle {
    ignore_changes = [ami, user_data]
  }

  tags = {
    Name    = "${var.project_name}-jenkins-server"
    Project = var.project_name
    Role    = "jenkins"
  }
}

output "jenkins_server_public_ip" {
  value = aws_instance.jenkins_server.public_ip
}
