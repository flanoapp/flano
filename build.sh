#!/bin/bash

PS3='Select the platform?: '
options=("ios" "android")
select opt in "${options[@]}"; do
  case $opt in
  "ios")
    platform="ios"
    break
    ;;
  "android")
    platform="android"
    break
    ;;
  *) echo "invalid option $REPLY" ;;
  esac
done

if [ $platform == 'ios' ]; then
  PS3='Select the type: '
  options=("simulator" "archive")
  select opt in "${options[@]}"; do
    case $opt in
    "simulator")
      type="simulator"
      break
      ;;
    "archive")
      type="archive"
      break
      ;;
    *) echo "invalid option $REPLY" ;;
    esac
  done
else
  PS3='Select the type: '
  options=("apk" "app-bundle")
  select opt in "${options[@]}"; do
    case $opt in
    "apk")
      type="apk"
      break
      ;;
    "app-bundle")
      type="app-bundle"
      break
      ;;
    *) echo "invalid option $REPLY" ;;
    esac
  done
fi

cp app.json app2.json

echo Replacing secrets ...
node replace_secrets.js

clean_up() {
  echo Cleaning up...
  rm app.json
  mv app2.json app.json
  exit 0
}
trap clean_up INT

echo Running expo build:$platform -t $type...
expo build:$platform -t $type
