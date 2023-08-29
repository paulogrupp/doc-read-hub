FROM ruby:3.2.2
RUN apt-get update -qq && apt-get install -y nodejs
WORKDIR /doc-read-hub
COPY Gemfile /doc-read-hub/Gemfile
COPY Gemfile.lock /doc-read-hub/Gemfile.lock
RUN bundle install

EXPOSE 3000
