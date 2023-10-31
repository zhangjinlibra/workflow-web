<p align="center">
<img src="https://ecs-public.oss-cn-shanghai.aliyuncs.com/beeflow.png">
<p align="center"><a>BeeFlow工作流</a></p>
</p>

## 🐼 简介

`workflow-engine` 是 `beeflow工作流` 的免费开源的流程设计器。设计器包含流程审批、表单设计、审批流程设计全套功能，开箱即用。

经过相当长一段时间的使用，我们觉得这个设计器还不错，所以决定开源前端流程设计器代码，期待帮助更多的同学，也期待您的反馈。

`对后端感兴趣或者有疑问的同学可以进群交流（进群方式在最下面）。` [[1](#-加入交流群)]

## 🐰 slogan

我们致力于打造简单、易用的工作流组件，使得流程开发和使用变得简单。

`项目会长期维护和不定期更新，有需求的小伙伴可以 ⭐ 一下，感谢支持。`

😁 源码：[github](https://github.com/zhangjinlibra/workflow-web.git) | [gitee](https://gitee.com/zhangjinlibra/beeflow-engine)

👉 演示地址：[beeflow 工作流](http://49.235.72.105) 👈

---

## 🦝 workflow-engine 简介

#### **流程基本信息**

![流程基本信息](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme10.png)

#### **表单设计**

> 我们提供了丰富的表单设计组件，可以让你方便、灵活的去构建复杂的表单项； \
> 每个组件都有对应的参数配置，可以更加灵活的控制每个组件展现形式。

![表单设计器](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme1.png)

#### **流程设计**

> 流程设计器分为三大节点类型：审批节点、抄送节点、分支节点；\
> 审批节点：配置节点的审批人，支持多级审批、会签、或签，流程流转过程中也支持加签、减签；\
> 抄送节点：可以在流程的任何节点定义抄送人；\
> 分支节点：支持复杂的分支条件，可根据定义的表单组件来动态匹配条件项。

![流程设计器](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme2.png)

![分支条件设置](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme3.png)

> 条件项支持表单必填项的文本匹配、单选多选项匹配、数字金额算术匹配、发起人来源匹配等

![审批节点设置](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme4.png)

> 常规设置：支持固定人员、上级、部门负责人、角色等审批类型；\
> 高级设置：当审批人明细为多个时，支持会签、或签。

![抄送节点设置](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme5.png)

#### **流程管理**

![流程列表](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme6.png)

#### **发起流程**

![发起申请](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme7.png)

![表单填写](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme8.png)

> 点击流程，流程表单必填项填写完整后，预览流程审批进度。

#### **审批操作**

![流程详情](https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme9.png)

> 流程在审批过程中，我们支持下面的这些动作：
>
> - 转交
> - 回退
> - 前加签
> - 后加签
> - 并加签
> - 减签
> - 评论

---

## 🐯 项目运行

```
# 环境依赖
npm i -S

# 运行测试环境
npm run test
```

## 👨‍👦‍👦 加入交流群

<table>
  <tbody>
    <tr>
      <td align="center" valign="middle">
        <img src="https://ecs-public.oss-cn-shanghai.aliyuncs.com/weichat_qrcode.png" class="no-zoom" style="width:120px;margin: 10px;">
        <p>进群备注: 工作流</p>
      </td>
      <td align="center" valign="middle">
        <img src="https://ecs-public.oss-cn-shanghai.aliyuncs.com/readme13.png" class="no-zoom" style="width:120px;margin: 10px;">
        <p>QQ群: 418513428</p>
      </td>
    </tr>
  </tbody>
</table>

## 🫶 支持一下呗

你们的支持是我们前进的最大动力！

**如果觉得这个项目帮助到了你，右上角点个 ⭐ 鼓励一下吧！**
