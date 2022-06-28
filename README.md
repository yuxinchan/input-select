# input-select

> Please install elementUI before using

## Attributes

| 参数         | 说明         | 类型        | 可选值        | 默认        |
| ----------- | ----------- | ----------- | ----------- | ----------- |
| value      | 输入框绑定数据(必填)| String  |              |            |
| value-change-immediate| 传入value值改变时马上响应改变，false为防抖状态| Boolean | | true|
| data      | 直接传入表格数据| Object  |              | {}       |
| get-data-function| 数据请求方法| Function  |              |            |
| requestSuccessCode| 定义请求成功对应的返回码| Number  |              |            |
| base-request-params| 请求数据的基础参数| Object  |              | {}       |
| column-key | 解析表头数据的参数key值(必填)| Object  |              | {key: '',orderKey: '',labelKey: ''}|
| row-key | 解析表格数据的参数key值(必填)| Object  |              | {key: '',orderKey: '',labelKey: ''} |
| request-key | 请求时请求参数里索引项的属性名| String  |              |            |
| placeholder | 输入框默认提示文字| String  |              |  false |
| disabled   | 输入框是否禁用（ slot添加的元素需要禁用请另外设置 ）| Boolean  |              | false |
| readonly   | 输入框是否只读（ slot添加的元素需要只读请另外设置 ）| Boolean  |              | false |
| prefix-icon | 输入框头部图标 | String |              |  |
| table-max-height | 弹出框表格最大高度 | String/Number |              | 300 |
| table-max-width | 弹出框表格最大宽度 | String/Number |              | 500 |
| size | 输入框尺寸 | String | mini, small, medium, large | large |
| tabindex | 输入框的tabindex | Boolean |              | false |
| prepend-focus-show | 聚焦输入框时才显示前置slot内容 | Boolean |              | false |
| append-focus-show | 聚焦输入框时才显示后置slot内容 | Boolean |              | false |
| empty-text | 搜索条件无匹配时显示的文字 | String |              | 无数据 |
| popper-class | 下拉框的类名 | String |              |  |
| no-table-cell-padding | 嵌入element表格时可将单元格padding设为0 | Boolean |              | false |
| arrow-right-after-select | 选择后触发键盘方向右键 | Boolean |              | false |
| arrow-right-when-enter | 键盘回车键触发键盘方向右键 | Boolean |              | false |

## Slots

| name        | 说明         |
| ----------- | ----------- |
| prefix      | 输入框头部内容 |
| suffix      | 输入框尾部内容 |
| prepend     | 输入框前置内容 |
| append      | 输入框后置内容 |

## Events

| 事件名称     | 说明         | 回调参数      |
| ----------- | ----------- | ----------- |
| change      | 组件对应的值改变时触发 | (value: string/number) |
| input      | 在 Input 值改变时触发 | (value: string) |
| blur      | 在 Input 失去焦点时触发 | (event: Event) |
| focus      | 在 Input 获得焦点时触发 | (event: Event) |
| clear      | 在点击由 clearable 属性生成的清空按钮时触发 | (event: Event) |
| keyDownLeft | 输入框键盘方向左键回调 | (event: Event) |
| keyDownRight | 输入框键盘方向右键回调 | (event: Event) |
| keyDownUp | 输入框键盘方向上键回调 | (event: Event) |
| keyDownDown | 输入框键盘方向下键回调 | (event: Event) |
| keyDownEnter | 输入框键盘回车键回调 | (event: Event) |
