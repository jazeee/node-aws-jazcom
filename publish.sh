#! /bin/bash

set -euxo pipefail

rm -f node-jaz-com.zip
zip node-jaz-com.zip -r *

aws lambda update-function-code --function-name arn:aws:lambda:us-west-2:759167017735:function:JazComPull --zip-file fileb://node-jaz-com.zip
