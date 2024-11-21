FROM alpine:3.18

# 시스템 패키지 업데이트 및 Node.js 설치
RUN apk update && \
    apk add --no-cache curl nodejs npm

# 앱 디렉토리 생성
WORKDIR /usr/src/new-bot

# package.json 및 package-lock.json 복사
COPY package*.json ./

# 의존성 설치
RUN npm install

# 소스 코드 복사
COPY . .

# 봇 실행
CMD ["npm", "run", "start"]
