#!/bin/bash

if [[ -z $(git status -uno --porcelain) ]]; then
  read -p "Enter the new version number: " VERSION;
  echo "## v$VERSION\n\n\n" | cat - yourfile > /tmp/out && mv /tmp/out yourfile
  vi content/releases/CHANGELOG.md;
  git diff package.json CHANGELOG.md;
  read -p "Look good? (y/n) " CONDITION;

  if [ "$CONDITION" == "y" ]; then
    git add package.json CHANGELOG.md;
    git commit -m "chore(publish): ${VERSION}";
    git tag "${VERSION}" -m "See https://github.com/redux-observable/redux-observable/blob/master/CHANGELOG.md";
    git push origin master;
    git push origin "${VERSION}";
    read -p "Which dist-tag? (latest) " DIST_TAG;
    DIST_TAG=${DIST_TAG:-latest}

    if [[ "$BUMP" =~ - ]] && [ "$DIST_TAG" == "latest" ]; then
      read -p "Using dist-tag 'latest' for a pre-release. ARE YOU SURE? (y/n) " CONDITION;

      if [ "$CONDITION" == "n" ] || [ "$CONDITION" == "" ]; then
        echo "Cancelled publish by your request!";
        exit 1;
      fi
    fi

    read -p "Enter 2FA auth token: " AUTH;
    npm publish --tag $DIST_TAG --otp $AUTH;
  else
    git checkout -f package.json CHANGELOG.md;
    echo "Cancelled publish by your request!";
    exit 1;
  fi

else
  echo "You cannot publish with uncommited changes";
  exit 1;
fi