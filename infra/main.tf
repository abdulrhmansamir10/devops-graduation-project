terraform {
  required_providers {
    aws = {
        source = "hashicorp/aws"
        version = "~> 5.0"
    }
  }
}

source "aws-sequrity-group" "app-firewall" {
  name        = "app-firewall-sg"
  description = "allows ssh, HTTP, App traffic"

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

    from_port  = 22
    to_port    = 22
    protocol   = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

    from_port  = 5000
    to_port    = 5000
    protocol   = "tcp"
    cidr_blocks = ["0.0.0.0/0"]

    egress {
      from_port   = 0
      to_port     = 0
      protocol    = "-1"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
}

source "aws_instance" "app-server" {
  ami           = "ami-0c55b159cbfafe1f0"
  instance_type = "t2.micro"
  security_groups = [aws_security_group.app-firewall.name]

  tags = {
    Name = "DevOps-Graduation-Project"
  }
}

source "aws_ecr_repository" "app-repo" {
  name = "pricing-app-repo"
}