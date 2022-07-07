# store_wx 是一款小程序全局状态管理仓库

参考设计方面采用proxy代理实现数据响应式，使用js的观察者以及发布订阅模式 监听以及获取 响应式最新数据



1. # 使用

​	

```javascript
	使用 import store from ‘store_wx’ 引入

​		实例化仓库对象	

​		new store({

​				state:{

​					...定义初始化响应式数据,

​					例如:

​					name:'xxx'

​				},

​			action:{

​				...定义操作响应式数据的方法

​				例如:

​				updateName(ctx,payload='yyy'){//ctx为上下文对象 ,payload 为传入的参数

​					ctx.state.name=payload

​				}				

​			}

​		})
```

当然也可以使用store实例对象 直接对state中响应式数据进行修改

# 2. API

我们为store实例对象提供了以下api

##### 2.1  watchState([...需要监听的响应式数据集合],callback回调)  

 注意callback回调函数接受一个对象，对象中的key为添加的监听响应式数据

##### 2.2 forceUpdate() 

当我们重新为响应式数据赋予一个新的引用类型数据时 ， 该数据是不具有响应式的，此时我们可以使用该方法强制更新state，使仓库中管理的数据重新达到响应式