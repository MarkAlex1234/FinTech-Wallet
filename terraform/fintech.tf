# # # ------------------ Provider ------------------
# # provider "aws" {
# #   region = "us-east-1"
# # }

# # # ------------------ Random Resources for Secrets ------------------
# # resource "random_password" "db_password" {
# #   length           = 16
# #   special          = true
# #   override_special = "!#_"
# # }

# # resource "random_password" "jwt_secret" {
# #   length  = 32
# #   special = false
# # }

# # resource "random_password" "kyc_api_key" {
# #   length  = 32
# #   special = false
# # }

# # # ------------------ SSM Parameter Store ------------------
# # resource "aws_ssm_parameter" "jwt_secret" {
# #   name  = "/fintech/jwt_secret"
# #   type  = "SecureString"
# #   value = random_password.jwt_secret.result
# # }

# # resource "aws_ssm_parameter" "db_username" {
# #   name  = "/fintech/db/username"
# #   type  = "SecureString"
# #   value = "fintech_user123"
# # }

# # resource "aws_ssm_parameter" "db_password" {
# #   name  = "/fintech/db/password"
# #   type  = "SecureString"
# #   value = random_password.db_password.result
# # }

# # # Individual SSM parameters for notification service secrets
# # resource "aws_ssm_parameter" "notification_sendgrid_api_key" {
# #   name  = "/fintech/notification/SENDGRID_API_KEY"
# #   type  = "SecureString"
# #   value = var.sendgrid_api_key
# # }

# # resource "aws_ssm_parameter" "notification_twilio_account_sid" {
# #   name  = "/fintech/notification/TWILIO_ACCOUNT_SID"
# #   type  = "SecureString"
# #   value = var.twilio_account_sid
# # }

# # resource "aws_ssm_parameter" "notification_twilio_auth_token" {
# #   name  = "/fintech/notification/TWILIO_AUTH_TOKEN"
# #   type  = "SecureString"
# #   value = var.twilio_auth_token
# # }

# # resource "aws_ssm_parameter" "notification_twilio_phone_number" {
# #   name  = "/fintech/notification/TWILIO_PHONE_NUMBER"
# #   type  = "SecureString"
# #   value = "+19388678305"
# #   overwrite = true
# # }

# # resource "aws_ssm_parameter" "notification_from_email" {
# #   name  = "/fintech/notification/FROM_EMAIL"
# #   type  = "SecureString"
# #   value = "islamabdelwahed61@gmail.com"
# # }

# # resource "aws_ssm_parameter" "notification_messaging_service_sid" {
# #   name  = "/fintech/notification/MESSAGING_SERVICE_SID"
# #   type  = "SecureString"
# #   value = "MGc7429cfdf49152f11be3fc95b0916734"
# # }

# # resource "aws_ssm_parameter" "service_configs" {
# #   for_each = toset(["auth", "compliance", "wallet", "transaction", "notification"])
# #   name     = "/fintech/${each.key}/config"
# #   type     = "String"
# #   value    = jsonencode(
# #     each.key == "auth" ? {
# #       KYC_API_URL = "https://facebook.com"
# #       KYC_API_KEY = "oaisdgfhpufgudgs"
# #       GRPC_PORT   = "5678"
# #     } : each.key == "compliance" ? {
# #       SANCTIONS_API_URL = "https://api.opensanctions.org/search/sanctions"
# #       SANCTIONS_API_KEY = "2a81cd117e82de8b3b2ff3aed4d7fe49"
# #       GRPC_PORT         = "5679"  # Added a new gRPC port for compliance service (choose a unique port if needed)
# #     } : each.key == "notification" ? {

# #     } : {}
# #   )
# # }

# # # ------------------ VPC ------------------
# # resource "aws_vpc" "fintech_vpc" {
# #   cidr_block = "10.0.0.0/16"
# # }

# # # # ------------------ Subnets ------------------
# # resource "aws_subnet" "fintech_subnet_a" {
# #   vpc_id            = aws_vpc.fintech_vpc.id
# #   cidr_block        = "10.0.1.0/24"
# #   availability_zone = "us-east-1a"
# # }

# # resource "aws_subnet" "fintech_subnet_b" {
# #   vpc_id            = aws_vpc.fintech_vpc.id
# #   cidr_block        = "10.0.2.0/24"
# #   availability_zone = "us-east-1b"
# # }

# # # ------------------ Internet Gateway & Route Table ------------------
# # resource "aws_internet_gateway" "fintech_igw" {
# #   vpc_id = aws_vpc.fintech_vpc.id
# # }

# # resource "aws_route_table" "fintech_rt" {
# #   vpc_id = aws_vpc.fintech_vpc.id

# #   route {
# #     cidr_block = "0.0.0.0/0"
# #     gateway_id = aws_internet_gateway.fintech_igw.id
# #   }
# # }

# # resource "aws_route_table_association" "fintech_rta_a" {
# #   subnet_id      = aws_subnet.fintech_subnet_a.id
# #   route_table_id = aws_route_table.fintech_rt.id
# # }

# # resource "aws_route_table_association" "fintech_rta_b" {
# #   subnet_id      = aws_subnet.fintech_subnet_b.id
# #   route_table_id = aws_route_table.fintech_rt.id
# # }

# # # ------------------ Security Groups ------------------
# # resource "aws_security_group" "alb_sg" {
# #   name        = "fintech-alb-sg"
# #   vpc_id      = aws_vpc.fintech_vpc.id
# #   description = "Allow HTTP to ALB"

# #   ingress {
# #     from_port   = 80
# #     to_port     = 80
# #     protocol    = "tcp"
# #     cidr_blocks = ["0.0.0.0/0"]
# #   }

# #   egress {
# #     from_port   = 0
# #     to_port     = 0
# #     protocol    = "-1"
# #     cidr_blocks = ["0.0.0.0/0"]
# #   }
# # }

# # resource "aws_security_group" "ecs_sg" {
# #   name        = "fintech-ecs-sg"
# #   vpc_id      = aws_vpc.fintech_vpc.id
# #   description = "Security group for ECS instances"
# # }
# #   ingress {
# #     from_port       = 3000
# #     to_port         = 3004
# #     protocol        = "tcp"
# #     security_groups = [aws_security_group.alb_sg.id]
# #   }

# #   egress {
# #     from_port   = 0
# #     to_port     = 0
# #     protocol    = "-1"
# #     cidr_blocks = ["0.0.0.0/0"]
# #   }
# # }

# # resource "aws_security_group" "db_sg" {
# #   name        = "fintech-db-sg"
# #   vpc_id      = aws_vpc.fintech_vpc.id
# #   description = "Allow RDS access from ECS SG"

# #   ingress {
# #     from_port       = 5432
# #     to_port         = 5432
# #     protocol        = "tcp"
# #     security_groups = [aws_security_group.ecs_sg.id]
# #   }

# #   egress {
# #     from_port   = 0
# #     to_port     = 0
# #     protocol    = "-1"
# #     cidr_blocks = ["0.0.0.0/0"]
# #   }
# # }

# # resource "aws_security_group" "redis_sg" {
# #   name        = "fintech-redis-sg"
# #   vpc_id      = aws_vpc.fintech_vpc.id
# #   description = "Allow Redis access from ECS SG"

# #   ingress {
# #     from_port       = 6379
# #     to_port         = 6379
# #     protocol        = "tcp"
# #     security_groups = [aws_security_group.ecs_sg.id]
# #   }

# #   egress {
# #     from_port   = 0
# #     to_port     = 0
# #     protocol    = "-1"
# #     cidr_blocks = ["0.0.0.0/0"]
# #   }
# # }

# # # ------------------ CloudWatch Logs ------------------
# # resource "aws_cloudwatch_log_group" "ecs_logs" {
# #   for_each          = toset(["auth", "wallet", "transaction", "compliance", "notification"])
# #   name              = "/ecs/fintech-${each.key}"
# #   retention_in_days = 7
# # }

# # # ------------------ RDS Subnet Group ------------------
# # resource "aws_db_subnet_group" "fintech_db_subnet" {
# #   name       = "fintech-dbsubnet"
# #   subnet_ids = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# #   tags       = { Name = "DB subnet group" }
# # }

# # # ------------------ RDS Instance ------------------
# # resource "aws_db_instance" "fintech_rds" {
# #   allocated_storage      = 20
# #   max_allocated_storage  = 20
# #   engine                 = "postgres"
# #   engine_version         = "17.4"
# #   instance_class         = "db.t4g.micro"
# #   db_name                = "mydb"
# #   username               = "fintech_user123"
# #   password               = random_password.db_password.result
# #   skip_final_snapshot    = true
# #   vpc_security_group_ids = [aws_security_group.db_sg.id]
# #   db_subnet_group_name   = aws_db_subnet_group.fintech_db_subnet.name
# #   publicly_accessible    = false

# #   backup_retention_period = 1
# #   deletion_protection     = false
# #   multi_az                = false
# #   storage_encrypted       = false
# # }

# # # ------------------ ElastiCache Subnet Group ------------------
# # resource "aws_elasticache_subnet_group" "fintech_redis_subnet" {
# #   name       = "fintech-redis-subnet-group"
# #   subnet_ids = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# #   tags       = { Name = "fintech-redis-subnet-group" }
# # }

# # # ------------------ ElastiCache Redis (Free Tier Eligible) ------------------
# # resource "aws_elasticache_cluster" "fintech_redis" {
# #   cluster_id           = "fintech-redis"
# #   engine               = "redis"
# #   engine_version       = "7.1"
# #   node_type            = "cache.t3.micro"
# #   num_cache_nodes      = 1
# #   parameter_group_name = "default.redis7"
# #   port                 = 6379
# #   subnet_group_name    = aws_elasticache_subnet_group.fintech_redis_subnet.name
# #   security_group_ids   = [aws_security_group.redis_sg.id]
# #   tags                 = { Name = "fintech-redis" }
# # }

# # # ------------------ ECS Cluster ------------------
# # resource "aws_ecs_cluster" "fintech_cluster" {
# #   name = "fintech-cluster"
# # }

# # # ------------------ Cloud Map Namespace ------------------
# # resource "aws_service_discovery_private_dns_namespace" "fintech_namespace" {
# #   name = "fintech.local"
# #   vpc  = aws_vpc.fintech_vpc.id
# # }

# # # ------------------ IAM Roles for ECS ------------------
# # resource "aws_iam_role" "ecs_instance_role" {
# #   name = "fintech-ecs-instance-role"
# #   assume_role_policy = jsonencode({
# #     Version = "2012-10-17"
# #     Statement = [{
# #       Action    = "sts:AssumeRole"
# #       Effect    = "Allow"
# #       Principal = { Service = "ec2.amazonaws.com" }
# #     }]
# #   })
# # }

# # resource "aws_iam_role_policy_attachment" "ecs_instance_attach" {
# #   role       = aws_iam_role.ecs_instance_role.name
# #   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonEC2ContainerServiceforEC2Role"
# # }

# # resource "aws_iam_role_policy_attachment" "ecs_instance_ecr_read" {
# #   role       = aws_iam_role.ecs_instance_role.name
# #   policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
# # }

# # resource "aws_iam_role_policy_attachment" "ecs_instance_ssm" {
# #   role       = aws_iam_role.ecs_instance_role.name
# #   policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
# # }

# resource "aws_iam_instance_profile" "ecs_instance_profile" {
#   name = "fintech-ecs-instance-profile"
#   role = aws_iam_role.ecs_instance_role.name
# }

# # resource "aws_iam_role" "ecs_task_execution_role" {
# #   name = "fintech-ecs-task-execution-role"
# #   assume_role_policy = jsonencode({
# #     Version = "2012-10-17"
# #     Statement = [{
# #       Action    = "sts:AssumeRole"
# #       Effect    = "Allow"
# #       Principal = { Service = "ecs-tasks.amazonaws.com" }
# #     }]
# #   })
# # }

# # resource "aws_iam_role_policy_attachment" "ecs_task_execution_attach" {
# #   role       = aws_iam_role.ecs_task_execution_role.name
# #   policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
# # }

# # resource "aws_iam_role_policy" "ecs_task_execution_ssm" {
# #   role = aws_iam_role.ecs_task_execution_role.id
# #   policy = jsonencode({
# #     Version = "2012-10-17"
# #     Statement = [{
# #       Effect = "Allow"
# #       Action = ["ssm:GetParameters", "ssm:GetParameter"]
# #       Resource = [
# #        aws_ssm_parameter.db_username.arn,
# #        aws_ssm_parameter.db_password.arn,
# #        "arn:aws:ssm:us-east-1:*:parameter/fintech/*"
# #       ]
# #     }]
# #   })
# # }

# # resource "aws_iam_role" "ecs_task_role" {
# #   name = "fintech-ecs-task-role"
# #   assume_role_policy = jsonencode({
# #     Version = "2012-10-17"
# #     Statement = [{
# #       Action    = "sts:AssumeRole"
# #       Effect    = "Allow"
# #       Principal = { Service = "ecs-tasks.amazonaws.com" }
# #     }]
# #   })
# # }

# # # ------------------ VPC Endpoints for SSM ------------------
# # resource "aws_vpc_endpoint" "ssm" {
# #   vpc_id            = aws_vpc.fintech_vpc.id
# #   service_name      = "com.amazonaws.us-east-1.ssm"
# #   vpc_endpoint_type = "Interface"
# #   subnet_ids        = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# #   security_group_ids = [aws_security_group.ecs_sg.id]
# # }

# # resource "aws_vpc_endpoint" "ssm_messages" {
# #   vpc_id            = aws_vpc.fintech_vpc.id
# #   service_name      = "com.amazonaws.us-east-1.ssmmessages"
# #   vpc_endpoint_type = "Interface"
# #   subnet_ids        = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# #   security_group_ids = [aws_security_group.ecs_sg.id]
# # }

# # resource "aws_vpc_endpoint" "ec2_messages" {
# #   vpc_id            = aws_vpc.fintech_vpc.id
# #   service_name      = "com.amazonaws.us-east-1.ec2messages"
# #   vpc_endpoint_type = "Interface"
# #   subnet_ids        = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# #   security_group_ids = [aws_security_group.ecs_sg.id]
# # }

# # # ------------------ ECS EC2 Instance ------------------
# data "aws_ami" "ecs_ami" {
#   most_recent = true
#   owners      = ["amazon"]
#   filter {
#     name   = "name"
#     values = ["amzn2-ami-ecs-hvm-*-x86_64-ebs"]
#   }
# }

# resource "aws_instance" "ecs_instance" {
#   ami                         = data.aws_ami.ecs_ami.id
#   instance_type               = "t3.small"
#   subnet_id                   = aws_subnet.fintech_subnet_a.id
#   vpc_security_group_ids      = [aws_security_group.ecs_sg.id]
#   iam_instance_profile        = aws_iam_instance_profile.ecs_instance_profile.name
#   associate_public_ip_address = true
#   user_data = <<-EOF
#               #!/bin/bash
#               echo ECS_CLUSTER=${aws_ecs_cluster.fintech_cluster.name} >> /etc/ecs/ecs.config
#               EOF
#   tags = { Name = "fintech-ecs-instance" }
# }

# # # ------------------ ECR Repositories ------------------
locals {
  services = ["auth", "wallet", "transaction", "compliance", "notification"]
  }
# #   service_configs = {
# #     auth = {
# #       port = 3000
# #       env = [
# #         { name = "NODE_ENV", value = "production" },
# #         { name = "PORT", value = "3000" },
# #         { name = "DB_HOST", value = aws_db_instance.fintech_rds.address },
# #         { name = "DB_PORT", value = "5432" },
# #         { name = "DB_NAME", value = "mydb" },
# #         { name = "REDIS_HOST", value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address },
# #         { name = "REDIS_PORT", value = "6379" },
# #         { name = "KAFKA_BROKERS", value = "localhost:9092" },
# #         { name = "KYC_API_URL", value = jsondecode(aws_ssm_parameter.service_configs["auth"].value)["KYC_API_URL"] },
# #         { name = "KYC_API_KEY", value = jsondecode(aws_ssm_parameter.service_configs["auth"].value)["KYC_API_KEY"] },
# #         { name = "GRPC_HOST", value = aws_instance.ecs_instance.private_ip },
# #         { name = "GRPC_PORT", value = jsondecode(aws_ssm_parameter.service_configs["auth"].value)["GRPC_PORT"] }
# #       ]
# #       secrets = [
# #         { name = "DB_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
# #         { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
# #         { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn }
# #       ]
# #     }
# #     wallet = {
# #       port = 3001
# #       env = [
# #         { name = "NODE_ENV", value = "production" },
# #         { name = "PORT", value = "3001" },
# #         { name = "DB_HOST", value = aws_db_instance.fintech_rds.address },
# #         { name = "DB_PORT", value = "5432" },
# #         { name = "DB_NAME", value = "mydb" },
# #         { name = "REDIS_HOST", value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address },
# #         { name = "REDIS_PORT", value = "6379" }, 
# #         { name = "PLAID_API_URL", value = "https://google.com" },
# #         { name = "PLAID_API_KEY", value = "fbhdjnksml" },
# #         { name = "KAFKA_BROKERS", value = "localhost:9092" },
# #         { name = "AUTH_GRPC_HOST", value = aws_instance.ecs_instance.private_ip },  
# #         { name = "AUTH_GRPC_PORT", value = jsondecode(aws_ssm_parameter.service_configs["auth"].value)["GRPC_PORT"] }
# #       ]
# #       secrets = [
# #         { name = "DB_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
# #         { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
# #         { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn }
# #       ]
# #     }
# #     transaction = {
# #       port = 3002
# #       env = [
# #         { name = "NODE_ENV", value = "production" },
# #         { name = "PORT", value = "3002" },
# #         { name = "DB_HOST", value = aws_db_instance.fintech_rds.address },
# #         { name = "DB_PORT", value = "5432" },
# #         { name = "DB_NAME", value = "mydb" },
# #         { name = "REDIS_HOST", value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address },
# #         { name = "REDIS_PORT", value = "6379" },
# #         { name = "KAFKA_BROKERS", value = "localhost:9092" },
# #         { name = "COMPLIANCE_GRPC_HOST", value = aws_instance.ecs_instance.private_ip },  # Added for gRPC connection to compliance (assuming same instance; adjust if needed)
# #         { name = "COMPLIANCE_GRPC_PORT", value = jsondecode(aws_ssm_parameter.service_configs["compliance"].value)["GRPC_PORT"] }
# #       ]
# #       secrets = [
# #         { name = "DB_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
# #         { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
# #         { name = "JWT_SECRET", valueFrom = aws_ssm_parameter.jwt_secret.arn }
# #       ]
# #     }
# #     compliance = {
# #       port = 3003
# #       env = [
# #         { name = "NODE_ENV", value = "production" },
# #         { name = "PORT", value = "3003" },
# #         { name = "DB_HOST", value = aws_db_instance.fintech_rds.address },
# #         { name = "DB_PORT", value = "5432" },
# #         { name = "DB_NAME", value = "mydb" },
# #         { name = "REDIS_HOST", value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address },
# #         { name = "REDIS_PORT", value = "6379" },
# #         { name = "KAFKA_BROKERS", value = "localhost:9092" },
# #         { name = "SANCTIONS_API_URL", value = jsondecode(aws_ssm_parameter.service_configs["compliance"].value)["SANCTIONS_API_URL"] },
# #         { name = "SANCTIONS_API_KEY", value = jsondecode(aws_ssm_parameter.service_configs["compliance"].value)["SANCTIONS_API_KEY"] },
# #         { name = "GRPC_HOST", value = aws_instance.ecs_instance.private_ip },  # Added for gRPC connection to compliance (assuming same instance; adjust if needed)
# #         { name = "GRPC_PORT", value = jsondecode(aws_ssm_parameter.service_configs["compliance"].value)["GRPC_PORT"] }
# #       ]
# #       secrets = [
# #         { name = "DB_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
# #         { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
# #         { name = "KYC_API_KEY", valueFrom = aws_ssm_parameter.jwt_secret.arn }
# #       ]
# #     }
# #     notification = {
# #       port = 3004
# #       env = [
# #         { name = "NODE_ENV", value = "production" },
# #         { name = "PORT", value = "3004" },
# #         { name = "DB_HOST", value = aws_db_instance.fintech_rds.address },
# #         { name = "DB_PORT", value = "5432" },
# #         { name = "DB_NAME", value = "mydb" },
# #         { name = "REDIS_HOST", value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address },
# #         { name = "REDIS_PORT", value = "6379" },
# #         { name = "KAFKA_BROKERS", value = "localhost:9092" }
# #       ]
# #       secrets = [
# #         { name = "DB_USERNAME", valueFrom = aws_ssm_parameter.db_username.arn },
# #         { name = "DB_PASSWORD", valueFrom = aws_ssm_parameter.db_password.arn },
# #        { name = "SENDGRID_API_KEY", valueFrom = aws_ssm_parameter.notification_sendgrid_api_key.arn },
# #         { name = "TWILIO_ACCOUNT_SID", valueFrom = aws_ssm_parameter.notification_twilio_account_sid.arn },
# #         { name = "TWILIO_AUTH_TOKEN", valueFrom = aws_ssm_parameter.notification_twilio_auth_token.arn },
# #         { name = "TWILIO_PHONE_NUMBER", valueFrom = aws_ssm_parameter.notification_twilio_phone_number.arn },
# #         { name = "FROM_EMAIL", valueFrom = aws_ssm_parameter.notification_from_email.arn },
# #         { name = "MESSAGING_SERVICE_SID", valueFrom = aws_ssm_parameter.notification_messaging_service_sid.arn }   ]
# #     }
# #   }
# # }

resource "aws_ecr_repository" "ecr_repos" {
  for_each = toset(local.services)
  name     = "fintech-${each.key}-repo"
}

# # # ------------------ Cloud Map Services ------------------
# # resource "aws_service_discovery_service" "sd_services" {
# #   for_each = toset(local.services)
# #   name     = each.key
# #   dns_config {
# #     namespace_id = aws_service_discovery_private_dns_namespace.fintech_namespace.id
# #     dns_records {
# #       type = "SRV"
# #       ttl  = 10
# #     }
# #     routing_policy = "MULTIVALUE"
# #   }
# # }

# # # ------------------ ECS Task Definitions ------------------
# # resource "aws_ecs_task_definition" "service_tasks" {
# #   for_each = toset(local.services)
# #   family                   = "fintech-${each.key}"
# #   cpu                      = "256"
# #   memory                   = "256"
# #   network_mode             = "host"
# #   requires_compatibilities = ["EC2"]
# #   execution_role_arn       = aws_iam_role.ecs_task_execution_role.arn
# #   task_role_arn            = aws_iam_role.ecs_task_role.arn
# #   container_definitions = jsonencode([{
# #     name  = each.key
# #     image = aws_ecr_repository.ecr_repos[each.key].repository_url

# #       portMappings = concat(
# #         [
# #           {
# #             containerPort = local.service_configs[each.key].port
# #             hostPort      = local.service_configs[each.key].port
# #           }
# #         ],
# #         # If GRPC_PORT exists in env, add it to portMappings
# #         length([
# #           for env_var in try(local.service_configs[each.key].env, []) : env_var
# #           if env_var.name == "GRPC_PORT"
# #         ]) > 0 ?
# #         [
# #           {
# #             containerPort = tonumber(
# #               lookup(
# #                 [for env_var in local.service_configs[each.key].env : env_var if env_var.name == "GRPC_PORT"][0],
# #                 "value",
# #                 5678
# #               )
# #             )
# #             hostPort = tonumber(
# #               lookup(
# #                 [for env_var in local.service_configs[each.key].env : env_var if env_var.name == "GRPC_PORT"][0],
# #                 "value",
# #                 5678
# #               )
# #             )
# #           }
# #         ] : []
# #       )

# #     environment = local.service_configs[each.key].env
# #     secrets = local.service_configs[each.key].secrets
# #     logConfiguration = {
# #       logDriver = "awslogs"
# #       options = {
# #         "awslogs-group"         = "/ecs/fintech-${each.key}"
# #         "awslogs-region"        = "us-east-1"
# #         "awslogs-stream-prefix" = "ecs"
# #       }
# #     }
# #   }])
# # }

# # # ------------------ Application Load Balancer ------------------
# # resource "aws_lb" "fintech_alb" {
# #   name               = "fintech-alb"
# #   internal           = false
# #   load_balancer_type = "application"
# #   security_groups    = [aws_security_group.alb_sg.id]
# #   subnets            = [aws_subnet.fintech_subnet_a.id, aws_subnet.fintech_subnet_b.id]
# # }

# # resource "aws_lb_listener" "http" {
# #   load_balancer_arn = aws_lb.fintech_alb.arn
# #   port              = 80
# #   protocol          = "HTTP"
# #   default_action {
# #     type = "fixed-response"
# #     fixed_response {
# #       content_type = "text/plain"
# #       message_body = "Not Found"
# #       status_code  = "404"
# #     }
# #   }
# # }

# # resource "aws_lb_target_group" "service_tgs" {
# #   for_each = toset(local.services)
# #   name        = "fintech-${each.key}-tg"
# #   port        = local.service_configs[each.key].port
# #   protocol    = "HTTP"
# #   vpc_id      = aws_vpc.fintech_vpc.id
# #   target_type = "instance"
# #   health_check {
# #     path = "/"
# #   }
# # }

# # resource "aws_lb_listener_rule" "service_rules" {
# #   for_each = toset(local.services)
# #   listener_arn = aws_lb_listener.http.arn
# #   priority     = index(local.services, each.key) + 1
# #   action {
# #     type             = "forward"
# #     target_group_arn = aws_lb_target_group.service_tgs[each.key].arn
# #   }
# #   condition {
# #     path_pattern {
# #       values = ["/${each.key}/*"]
# #     }
# #   }
# # }

# # # ------------------ ECS Services ------------------
# # resource "aws_ecs_service" "services" {
# #   for_each = toset(local.services)
# #   name            = each.key
# #   cluster         = aws_ecs_cluster.fintech_cluster.id
# #   task_definition = aws_ecs_task_definition.service_tasks[each.key].arn
# #   desired_count   = 1
# #   launch_type     = "EC2"
# #   load_balancer {
# #     target_group_arn = aws_lb_target_group.service_tgs[each.key].arn
# #     container_name   = each.key
# #     container_port   = local.service_configs[each.key].port
# #   }
# #   service_registries {
# #     registry_arn   = aws_service_discovery_service.sd_services[each.key].arn
# #     container_name = each.key
# #     container_port = local.service_configs[each.key].port
# #   }
# #   depends_on = [aws_instance.ecs_instance]
# # }

# # # ------------------ Kafka & Zookeeper Security Group Rules ------------------
# # resource "aws_security_group_rule" "allow_kafka" {
# #   type              = "ingress"
# #   from_port         = 9092
# #   to_port           = 9092
# #   protocol          = "tcp"
# #   security_group_id = aws_security_group.ecs_sg.id
# #   source_security_group_id = aws_security_group.ecs_sg.id  # Self-referential
# #   description       = "Allow Kafka broker from inside VPC"
# # }

# # # ------------------ S3 Bucket for Kafka Installer ------------------
# # # resource "aws_s3_bucket" "scripts" {
# # #   bucket = "fintech-scripts-${random_id.suffix.hex}"
# # # }

# # # resource "random_id" "suffix" {
# # #   byte_length = 4
# # # }

# # # resource "aws_iam_role_policy_attachment" "ecs_instance_s3_read" {
# # #   role       = aws_iam_role.ecs_instance_role.name
# # #   policy_arn = "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
# # # }

# # # resource "aws_vpc_endpoint" "s3" {
# # #   vpc_id            = aws_vpc.fintech_vpc.id
# # #   service_name      = "com.amazonaws.us-east-1.s3"
# # #   vpc_endpoint_type = "Gateway"
# # #   route_table_ids   = [aws_route_table.fintech_rt.id]
# # # }

# # resource "aws_ssm_document" "kafka_install_doc" {
# #   name          = "Install-Kafka_Zookeeper"
# #   document_type = "Command"
# #   document_format = "JSON"

# #   content = <<EOF
# # {
# #   "schemaVersion": "2.2",
# #   "description": "Install Apache Kafka 4.1.0 in KRaft mode (no ZooKeeper) and configure systemd service",
# #   "mainSteps": [
# #     {
# #       "action": "aws:runShellScript",
# #       "name": "installKafkaKRaft",
# #       "inputs": {
# #         "runCommand": [
# #           "#!/bin/bash -e",
# #           "set -x",
# #           "",
# #           "# --- Variables ---",
# #           "KAFKA_VERSION=4.1.0",
# #           "SCALA_VERSION=2.13",
# #           "INSTALL_DIR=/opt/kafka",
# #           "DATA_DIR=/opt/kafka/data",
# #           "",
# #           "# 1) Install Java (Amazon Corretto 17) if not present",
# #           "if ! command -v java >/dev/null 2>&1; then",
# #           "  rpm --import https://yum.corretto.aws/corretto.key",
# #           "  curl -L -o /etc/yum.repos.d/corretto.repo https://yum.corretto.aws/corretto.repo",
# #           "  if command -v dnf >/dev/null 2>&1; then",
# #           "    dnf update -y",
# #           "    dnf install -y java-17-amazon-corretto-devel",
# #           "  else",
# #           "    yum update -y",
# #           "    yum install -y java-17-amazon-corretto-devel",
# #           "  fi",
# #           "fi",
# #           "",
# #           "# 2) Create 'kafka' user if it doesn't exist",
# #           "if ! id -u kafka >/dev/null 2>&1; then useradd -r -m -s /bin/bash kafka || true; fi",
# #           "",
# #           "# 3) Download and install Kafka if not already present",
# #           "if [ ! -f \"$${INSTALL_DIR}/bin/kafka-server-start.sh\" ]; then",
# #           "  mkdir -p /tmp/kafka-install",
# #           "  cd /tmp/kafka-install",
# #           "  KAFKA_TGZ=kafka_$${SCALA_VERSION}-$${KAFKA_VERSION}.tgz",
# #           "  KAFKA_URL=https://downloads.apache.org/kafka/$${KAFKA_VERSION}/$${KAFKA_TGZ}",
# #           "  curl -fSL \"$KAFKA_URL\" -o \"$KAFKA_TGZ\"",
# #           "  tar -xzf \"$KAFKA_TGZ\"",
# #           "  rm -rf $${INSTALL_DIR} || true",
# #           "  mv kafka_$${SCALA_VERSION}-$${KAFKA_VERSION} $${INSTALL_DIR}",
# #           "fi",
# #           "",
# #           "# 4) Data dir and permissions",
# #           "mkdir -p $${DATA_DIR}",
# #           "chown -R kafka:kafka $${INSTALL_DIR}",
# #           "chmod -R 755 $${INSTALL_DIR}",
# #           "chown -R kafka:kafka $${DATA_DIR}",
# #           "chmod -R 700 $${DATA_DIR}",
# #           "",
# #           "# 5) Create a minimal KRaft server.properties (broker+controller single-node)",
# #           "mkdir -p $${INSTALL_DIR}/config/kraft",
# #           "PRIVATE_IP=$(curl -s http://169.254.169.254/latest/meta-data/local-ipv4)",
# #           "cat > $${INSTALL_DIR}/config/kraft/server.properties <<KAFRTPL",
# #           "process.roles=broker,controller",
# #           "node.id=1",
# #           "controller.quorum.voters=1@localhost:9093",
# #           "controller.listener.names=CONTROLLER",
# #           "listeners=PLAINTEXT://0.0.0.0:9092,CONTROLLER://0.0.0.0:9093",
# #           "advertised.listeners=PLAINTEXT://$PRIVATE_IP:9092",
# #           "listener.security.protocol.map=CONTROLLER:PLAINTEXT,PLAINTEXT:PLAINTEXT",
# #           "inter.broker.listener.name=PLAINTEXT",
# #           "log.dirs=/opt/kafka/data",
# #           "num.partitions=1",
# #           "offsets.topic.replication.factor=1",
# #           "transaction.state.log.replication.factor=1",
# #           "transaction.state.log.min.isr=1",
# #           "# adjust other settings as needed",
# #           "KAFRTPL",
# #           "chown kafka:kafka $${INSTALL_DIR}/config/kraft/server.properties",
# #           "",
# #           "# 6) Write systemd unit for KRaft Kafka (no ZooKeeper)",
# #           "cat > /etc/systemd/system/kafka.service <<'UNIT'",
# #           "[Unit]",
# #           "Description=Apache Kafka (KRaft mode)",
# #           "After=network.target",
# #           "",
# #           "[Service]",
# #           "Type=simple",
# #           "User=kafka",
# #           "Environment=\"KAFKA_HEAP_OPTS=-Xmx512M -Xms512M\"",
# #           "ExecStart=/opt/kafka/bin/kafka-server-start.sh /opt/kafka/config/kraft/server.properties",
# #           "ExecStop=/opt/kafka/bin/kafka-server-stop.sh",
# #           "Restart=on-failure",
# #           "",
# #           "[Install]",
# #           "WantedBy=multi-user.target",
# #           "UNIT",
# #           "",
# #           "systemctl daemon-reload",
# #           "",
# #           "# 7) Format storage if not formatted already",
# #           "if [ ! -f \"$${DATA_DIR}/meta.properties\" ]; then",
# #           "  sudo -u kafka /opt/kafka/bin/kafka-storage.sh format -t $(/opt/kafka/bin/kafka-storage.sh random-uuid) -c /opt/kafka/config/kraft/server.properties",
# #           "fi",
# #           "",
# #           "# 8) Enable and start Kafka service",
# #           "systemctl enable kafka --now || true",
# #           "",
# #           "# 9) Quick status (non-fatal if it fails)",
# #           "sleep 2",
# #           "systemctl status kafka --no-pager || true",
# #           "",
# #           "echo 'Kafka KRaft installation complete.'"
# #         ]
# #       }
# #     }
# #   ]
# # }
# # EOF
# # }


# # # ------------------ Outputs ------------------

# # output "ssm_document" {
# #   value = aws_ssm_document.kafka_install_doc.name
# # }
# # output "redis_endpoint" {
# #   value = aws_elasticache_cluster.fintech_redis.cache_nodes[0].address
# # }
# # output "alb_dns" {
# #   value = aws_lb.fintech_alb.dns_name
# # }
# # output "db_password" {
# #   value     = random_password.db_password.result
# #   sensitive = true
# # }
# # output "jwt_secret" {
# #   value     = random_password.jwt_secret.result
# #   sensitive = true
# # }
# # output "kyc_api_key" {
# #   value     = random_password.kyc_api_key.result
# #   sensitive = true
# # }