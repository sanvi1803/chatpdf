# Bucket Policy

Bucket Policy:{
"Version": "2012-10-17",
"Statement": [
{
"Sid": "PublicReadGetObject",
"Effect": "Allow",
"Principal": "*",
"Action": "s3:GetObject",
"Resource": "arn:aws:s3:::chatpdf18/*"
}
]
}

# Cors Policy

CorsPolicy:[
{
"AllowedHeaders":["*"],
"AllowedMethods":["PUT","GET","DELETE","POST"],
"AllowedOrigins":["*"],
"ExposeHeaders":[]

    }

]
