//实现深度对象监听，数组push，等监听的全局状态管理仓库

class store {
  constructor({ state, action }) {
    this.watchStateArr = [];
    this.mappingState(state);
    this.mappingAction(action);
  }

  //重新复制新的引用类型值时 调用该方法强制更新仓库 重新达到响应式
  forceUpdate() {
    this.mappingState({ ...JSON.parse(JSON.stringify(this.state)) });
  }
  mappingState(state) {
    var that = this;
    this.state = new Proxy(state, {
      set(obj, key, value) {
        //监听设置

        Reflect.set(obj, key, value);
        that.watchStateArr.forEach((watchStateArrItem) => {
          // console.log(obj)
          if (
            watchStateArrItem.watchStates.some(
              (watchStateItem) => watchStateItem == key
            )
          ) {
            var watchCallBackFnParams = {};

            watchStateArrItem.watchStates.forEach((watchStateItem) => {
              watchCallBackFnParams[watchStateItem] = state[watchStateItem];
            });
            watchStateArrItem.watchCallBackFn(watchCallBackFnParams);
          }
        });

        return true;
      },
      get(obj, key) {
        //监听获取
        // console.log('x')
        // console.log(Reflect.get(obj,key))
        return Reflect.get(obj, key);
      },
    });

    //先从最外层开始遍历

    this.parseWatchArr(state, this.state);
  }

  parseWatchArr(state, proxState) {
    Object.keys(state).forEach((watchStateItemKey) => {
      this.traverseWatchStates(
        [watchStateItemKey],
        state[watchStateItemKey],
        proxState
      );
    });
  }

  traverseWatchStates(stateKeyList, watchStatesItem, proxyStateItem) {
    var that = this;
    
    if (Object.prototype.toString.call(watchStatesItem) == "[object Object]") {
      proxyStateItem[stateKeyList.at(-1)] = new Proxy(watchStatesItem, {
        get(obj, key) {
          return Reflect.get(obj, key);
        },
        set(obj, key, value) {
          Reflect.set(obj, key, value);

          Reflect.set(
            that.state,
            stateKeyList[0],
            Reflect.get(that.state, stateKeyList[0])
          );

          return true;
        },
      });

      Object.keys(watchStatesItem).forEach((watchStateItemKey) => {
        this.traverseWatchStates(
          [...stateKeyList, watchStateItemKey],
          watchStatesItem[watchStateItemKey]
        );
      });
    }
    if (Object.prototype.toString.call(watchStatesItem) == "[object Array]") {
      this.observerArr(stateKeyList, watchStatesItem);
    }
  }
  observerArr(stateKeyList, watchArr) {
    var that = this;
    var arrMethods = [
      "push",
      "pop",
      "shift",
      "unshift",
      "splice",
      "sort",
      "reverse",
    ];
    var newPrototype = Object.create(Array.prototype); //创建一个自定义新的数组prototy
    arrMethods.forEach((method) => {
      newPrototype[method] = function (...params) {
        Array.prototype[method].apply(this, params);
        var evalStr = "that.state";

        stateKeyList.forEach((key) => {
          evalStr += "." + key;
        });
        eval(`${evalStr}=${JSON.stringify(watchArr)}`);

        //    Reflect.set(Reflect.get(eval(`${evalStr}`),lastkey),lastkey,watchArr)

        Reflect.set(
          that.state,
          stateKeyList[0],
          Reflect.get(that.state, stateKeyList[0])
        );

        that.mappingState({ ...JSON.parse(JSON.stringify(that.state)) });
      };
    });

    watchArr.__proto__ = newPrototype;
  }

  mappingAction(action) {
    Object.keys(action).forEach((actionName) => {
      this[actionName] = function (params) {
        return action[actionName](this, params);
      };
    });
  }
  watchState(watchStates, callback) {
    this.watchStateArr.push({
      watchStates,
      watchCallBackFn: callback,
    });
  }
}

export default store;
