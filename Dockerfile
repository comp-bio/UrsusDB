# syntax=docker/dockerfile:1
FROM python:3.9-alpine

RUN apk update
RUN apk add mdbtools-utils

COPY requirements.txt requirements.txt
COPY application application
COPY build build
COPY run.py start.sh ./

RUN pip3 install -r requirements.txt

EXPOSE 9410/tcp
EXPOSE 9420/tcp
ENTRYPOINT ["./start.sh"]
