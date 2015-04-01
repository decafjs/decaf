#!/bin/bash

# determine OS and other useful information
if [[ $OSTYPE = darwin* ]]; then
    OS="OSX"
    CPUS=`sysctl -n hw.ncpu`
    FREEMEM="$(( $(vm_stat | awk '/free/ {gsub(/\./, "", $3); print $3}') * 4096 / 1048576))"
else
    OS="LINUX"
    CPUS=`grep vendor_id /proc/cpuinfo | wc -l`
    FREEMEM=`grep -i memfree /proc/meminfo | sed -e 's/MemFree:[ ]*//' | sed -e 's/ kB//'`
    n=$((FREEMEM / 1024))
    FREEMEM=$n
fi
FREEMEM=$((FREEMEM/2))

# figure out where decaf dependencies are
# assume /usr/local/decaf
#
# but maybe user is working within the git working set
# so see if the dependencies are in the current directory
DECAF='/usr/local/decaf'
if [ -d "java" ]; then
    DECAF=$PWD
    MODULES=$PWD
fi
if [ -d "bower_components/decaf" ]; then
    DECAF="$PWD/bower_components/decaf"
    MODULES=`ls -1 $PWD/bower_components/*/java/*.jar | tr "\\n" ":"`
fi
if [ -d "modules" ]; then
    LOCAL_MODULES=`find modules -name "*.jar"` | tr "\\n" ":"
    if [ "${#LOCAL_MODULES}" -gt 0 ]; then
        MODULES="$LOCAL_MODULES:$MODULES"
    fi
fi
if [ -d "/usr/local/decaf/modules" ]; then
    LOCAL_MODULES=`find /usr/local/decaf/modules -name "*.jar"` | tr "\\n" ":"
    if [ "${#LOCAL_MODULES}" -gt 0 ]; then
        MODULES="$LOCAL_MODULES:$MODULES"
    fi
fi

# On Linux, MySQL JDBC driver needs to be manually loaded
if [[ $OSTYPE == "linux-gnu" ]]; then
    MODULES="/usr/share/java/mysql-connector-java.jar:$MODULES"
fi

# set up class path for java/rhino
CP="."

if [ ! -z "$MODULES" ]; then
    CP="$CP:$MODULES/*/java/*.jar"
fi
#
#if [ -d "modules" ]; then
#    CP="$CP:modules/*/java/*.jar"
#fi

if [ -d "java" ]; then
    DECAF_JAVA=`ls -1 java/*.jar | tr "\\n" ":"` # | sed 's!\:$!!'
    DECAF_JAVA=${DECAF_JAVA%:}
    CP="$CP:$DECAF_JAVA"
    if [ "$RHINO" = "true" ]; then
        DECAF_JAVA=`ls -1 java/rhino/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    else
        DECAF_JAVA=`ls -1 java/nashorn/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    fi
#    CP="$CP:./java/*.jar:./java/ext/rhino-1.7R5-20130223-1.jar"
elif [ -d "bower_components/decaf/java" ]; then
    DECAF_JAVA=`ls -1 bower_components/decaf/java/*.jar | tr "\\n" ":"` # | sed 's!\:$!!'
    DECAF_JAVA=${DECAF_JAVA%:}
    CP="$CP:$DECAF_JAVA"
    if [ "$RHINO" = "true" ]; then
        DECAF_JAVA=`ls -1 bower_components/decaf/java/rhino/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    else
        DECAF_JAVA=`ls -1 bower_components/decaf/java/nashorn/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    fi
elif [ -d "/usr/local/decaf/java" ]; then
    DECAF_JAVA=`ls -1 /usr/local/decaf/java/*.jar | tr "\\n" ":"` # | sed 's!\:$!!'
    DECAF_JAVA=${DECAF_JAVA%:}
    CP="$CP:$DECAF_JAVA"
    if [ "$RHINO" = "true" ]; then
        DECAF_JAVA=`ls -1 /usr/local/decaf/java/rhino/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    else
        DECAF_JAVA=`ls -1 /usr/local/decaf/java/nashorn/*.jar | tr "\\n" ":"`
        CP="$CP:$DECAF_JAVA"
    fi
fi
