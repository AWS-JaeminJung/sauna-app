variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-2"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "sauna-app"
}

variable "account_id" {
  description = "AWS Account ID"
  type        = string
  default     = "031273582910"
}

variable "aurora_master_password" {
  description = "Aurora master password"
  type        = string
  sensitive   = true
}

variable "jwt_secret_key" {
  description = "JWT secret key for auth"
  type        = string
  sensitive   = true
}
