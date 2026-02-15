# Lambda function
resource "aws_lambda_function" "api" {
  function_name = "${var.project_name}-api"
  role          = aws_iam_role.lambda.arn
  handler       = "mangum_handler.handler"
  runtime       = "python3.11"
  timeout       = 30
  memory_size   = 512
  filename      = "${path.module}/../backend/lambda.zip"

  source_code_hash = filebase64sha256("${path.module}/../backend/lambda.zip")

  vpc_config {
    subnet_ids         = data.aws_subnets.default.ids
    security_group_ids = [aws_security_group.lambda.id]
  }

  environment {
    variables = {
      DATABASE_URL = "mysql+aiomysql://admin:${var.aurora_master_password}@${aws_rds_cluster.main.endpoint}:3306/sauna_booking"
      SECRET_KEY   = var.jwt_secret_key
      CORS_ORIGINS = "[\"*\"]"
      STAGE        = "prod"
    }
  }

  tags = {
    Project = var.project_name
  }

  depends_on = [
    aws_iam_role_policy_attachment.lambda_basic,
    aws_iam_role_policy_attachment.lambda_vpc,
  ]
}

# Lambda permission for API Gateway
resource "aws_lambda_permission" "apigw" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.api.function_name
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.main.execution_arn}/*/*"
}
