variable "aws_region" {
  default = "ap-south-1"
}

variable "project_name" {
  default = "ticketnova"
}

variable "app_instance_type" {
  default = "t2.micro"
}

variable "jenkins_instance_type" {
  default = "t3.medium"
}

variable "key_pair_name" {
  default = "ticketnova-key"
}

variable "mongo_uri" {
  description = "MongoDB Atlas connection string"
  default     = "mongodb+srv://tejaspolekar559_db_user:znwsSVxNA58145t5@ticketnova-cluster.mrja460.mongodb.net/ticketnova?retryWrites=true&w=majority&appName=ticketnova-cluster"
}
