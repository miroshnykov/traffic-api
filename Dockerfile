FROM ubuntu:18.04
ARG node_version=12.16.1

#COPY tests/run_docker_tests.sh /usr/local/bin/run_docker_tests.sh
RUN rm -rf /var/lib/apt/lists/*

RUN apt-get update
RUN apt-get install \
    build-essential \
    apt-transport-https \
    lsb-release \
    ca-certificates \
    curl \
    wget \
    python -y \
    redis-server

RUN curl --silent --location https://deb.nodesource.com/setup_12.x | bash -
RUN apt-get install --yes nodejs

RUN mkdir /tmp/co-recipe-traffic
RUN chmod 755 /tmp

WORKDIR /home/app
COPY . .
RUN npm install
# RUN npm run build
EXPOSE 5000


# Required to push into different branchs.
ARG branch
ENV BRANCH=${branch}

ENTRYPOINT redis-server --daemonize yes && if [ "$BRANCH" = "stage1" ] ; then \
        npm run stage1 ; \
    elif [ "$BRANCH" = "stage2" ] ; then \
        npm run stage2 ; \
    else \
        npm run prod ; \
    fi
