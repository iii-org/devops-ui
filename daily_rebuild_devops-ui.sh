#! /bin/bash

LOGFILE=$HOME/daily-build/log/daily_deploy_devops-ui.log

sudo rm -rf $HOME/daily-build/ui/devops-ui/ &>> $LOGFILE
git clone --single-branch --branch develop https://github.com/iii-org/devops-ui.git $HOME/daily-build/ui/devops-ui &>> $LOGFILE
sudo chmod -R 777 $HOME/daily-build/ui/devops-ui
cp -pr $HOME/daily-build/ui/.env.staging $HOME/daily-build/ui/devops-ui/ &>> $LOGFILE

GIT_ID=$HOME/daily-build/ui/devops-ui/.git/refs/heads/develop &>> $LOGFILE
echo "VUE_APP_VERSION='$(cat $GIT_ID)'" >> $HOME/daily-build/ui/devops-ui/.env.staging

NOW_TIME=$(date +"%m%d%H%M") &>> $LOGFILE
echo $NOW_TIME &>> $LOGFILE

docker run --rm -v $HOME/daily-build/ui/devops-ui:/home/node/app -i 10.50.1.63:5443/dockerhub/library/node:14 sh -c "cd /home/node/app && npm install && npm run build:stage && ls" &>> $LOGFILE
#sudo chmod -R 777 $HOME/daily-build/ui/devops-ui

cd $HOME/daily-build/ui/devops-ui/ &>> $LOGFILE
SHORT_CIT_ID=$(cat $GIT_ID | cut -c1-7) &>> $LOGFILE
echo $SHORT_CIT_ID &>> $LOGFILE

HARBOR_URL='10.50.1.63:5443' &>> $LOGFILE
DOCKERFILE=$HOME/daily-build/ui/devops-ui/Dockerfile &>> $LOGFILE
if [ ! "$HARBOR_URL" = "DOCKERFILE" ] ; then
    sed -e "s,FROM nginx:1.19,FROM 10.50.1.63:5443/dockerhub/library/nginx:1.19,g" -i $DOCKERFILE &>> $LOGFILE
fi

docker build $HOME/daily-build/ui/devops-ui --tag iiiorg/devops-ui:${SHORT_CIT_ID}-${NOW_TIME} &>> $LOGFILE
docker build $HOME/daily-build/ui/devops-ui --tag iiiorg/devops-ui:develop &>> $LOGFILE
docker login -u demoyuw -p 0918101553 &>> $LOGFILE
docker push iiiorg/devops-ui:${SHORT_CIT_ID}-${NOW_TIME} &>> $LOGFILE
docker push iiiorg/devops-ui:develop &>> $LOGFILE

cp $HOME/daily-build/ui/devopswebui-deployment.yaml.tmp $HOME/daily-build/ui/devops-ui/devopswebui-deployment.yaml &>> $LOGFILE
DEPLOYYAML=$HOME/daily-build/ui/devops-ui/devopswebui-deployment.yaml &>> $LOGFILE
if [ ! "$SHORT_CIT_ID" = "$DEPLOYYAML" ] ; then
    sed -e "s,iiiorg/devops-ui,iiiorg/devops-ui:${SHORT_CIT_ID}-${NOW_TIME},g" -i $DEPLOYYAML &>> $LOGFILE
fi
kubectl apply -f $HOME/daily-build/ui/devops-ui/devopswebui-deployment.yaml &>> $LOGFILE
