# 使用官方 Python 3.10 轻量级镜像
FROM python:3.10-slim

# 设置工作目录
WORKDIR /app

# 设置环境变量
# 防止 Python 生成 .pyc 文件
ENV PYTHONDONTWRITEBYTECODE=1
# 让日志直接输出到控制台
ENV PYTHONUNBUFFERED=1

# 安装系统依赖（如果某些 Python 库需要编译，可能需要 build-essential 等）
# apt-get update && apt-get install -y build-essential && rm -rf /var/lib/apt/lists/*

# 复制依赖文件
COPY requirements.txt .

# 安装依赖
# 使用阿里云镜像加速，加快构建速度
RUN pip install --no-cache-dir -r requirements.txt -i https://mirrors.aliyun.com/pypi/simple/

# 复制项目代码
COPY main.py .
COPY app ./app

# 注意：bge-m3 模型和 hf_cache 不会复制进镜像，而是通过挂载或运行时下载

# 暴露端口
EXPOSE 8000

# 启动命令
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
