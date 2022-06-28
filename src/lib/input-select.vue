<template>
  <div class="table-select-wrapper" ref="tableWrapper" :style="{ height: inputHeight }">
    <el-popover
      class="input-select-popover"
      ref="tablePopover"
      v-model="popoverVisible"
      placement="bottom-start"
      trigger="manual"
      :popper-class="popperClass"
      @keyup.enter.native="enterSelect"
      @keydown.down.native="downSelect"
      @keydown.up.native="upSelect"
      :style="{width: popoverWidth + 'px'}"
    >
      <el-table
        ref="selectTable"
        class="selectTable"
        :data="tableData"
        :max-height="tableMaxHeight"
        highlight-current-row
        border
        :row-key="rowKey.key"
        :empty-text="emptyText"
        @row-click="tableRowClick"
        @cell-mouse-enter="hoverRow"
        @cell-mouse-leave="leaveRow"
      >
        <el-table-column
          v-for="item in tableColumn"
          :prop="item[columnKey.key]"
          :label="item[columnKey.labelKey]"
          :width="item.width">
        </el-table-column>
      </el-table>

      <el-input
        slot="reference"
        ref="selectInput"
        class="selectInput"
        v-model="inputText"
        :placeholder="placeholder"
        :clearable="clearable"
        :disabled="disabled"
        :readonly="readonly"
        :prefix-icon="prefixIcon"
        :suffix-icon="suffixIcon"
        :tabindex="tabindex"
        :validate-event="validateEvent"
        @blur="inputBlur"
        @focus="inputFocus"
        @clear="inputClear"
        @input="handleInput"
        @keydown.left.native="keyboardLeft"
        @keydown.right.native="keyboardRight"
        @keydown.up.native="keyboardUp"
        @keydown.down.native="keyboardDown"
        @keydown.enter.native="keyboardEnter"
      >
        <template slot="prefix"><slot name="prefix"></slot></template>
        <template slot="suffix"><slot name="suffix"></slot></template>
        <template slot="prepend"><slot name="prepend"></slot></template>
        <template slot="append"><slot name="append"></slot></template>
      </el-input>
    </el-popover>
  </div>
</template>

<script>
export default {
  name: 'InputSelect',
  model: {
    prop: 'value', // 表明v-model传进来的变量，由props的指定变量接收
    event: 'change' // 表明子组件可以通过change这个方法可修改外部v-model变量，这样就可实现双向修改绑定
  },
  props: {
    // 输入框绑定内容（ 必填 ）
    value: {
      required: true
    },
    // 传入value值改变时马上响应改变，false为防抖状态
    valueChangeImmediate: {
      type: Boolean,
      default: true
    },

    // 直接传入表格数据
    data: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 数据请求方法
    getDataFunction: {
      type: Function
    },
    // 定义请求成功返回码
    requestSuccessCode: {
      type: Number
    },
    // 基础请求参数
    baseRequestParams: {
      type: Object,
      default: () => {
        return {}
      }
    },
    // 表头的参数key值（ 必填 ）
    columnKey: {
      type: Object,
      default: () => {
        return {
          key: '',
          orderKey: '',
          labelKey: ''
        }
      },
      required: true
    },
    // 数据的参数key值（ 必填 ）
    rowKey: {
      type: Object,
      default: () => {
        return {
          key: '',
          orderKey: '',
          labelKey: ''
        }
      },
      required: true
    },
    // 请求时索引项的属性名（ 必填 ）
    requestKey: {
      type: String,
      default: '',
      required: true
    },

    // 输入框默认提示文字
    placeholder: {
      type: String,
      default: ''
    },
    // 输入框是否可清空
    clearable: {
      type: Boolean,
      default: false
    },
    // 输入框是否禁用（ slot添加的输入框按钮续另外设置禁用 ）
    disabled: {
      type: Boolean,
      default: false
    },
    // 输入框是否只读（ slot添加的输入框按钮续另外设置只读 ）
    readonly: {
      type: Boolean,
      default: false
    },
    // 输入框头部图标
    prefixIcon: {
      type: String,
      default: undefined
    },
    // 输入框尾部图标
    suffixIcon: {
      type: String,
      default: undefined
    },
    // 弹出框表格最大高度
    tableMaxHeight: {
      type: [String, Number],
      default: 300
    },
    // 弹出框表格最大宽度
    tableMaxWidth: {
      type: [String, Number],
      default: 500
    },
    // 输入框尺寸
    size: {
      type: String,
      validator: val => ['mini', 'small', 'medium', 'large'].includes(val),
      default: 'large',
    },
    // 输入框的tabindex
    tabindex: {
      type: String,
      default: undefined
    },
    // 是否隐藏边框
    noBorder: {
      type: Boolean,
      default: false
    },
    // 聚焦输入框时才显示前置内容
    prependFocusShow: {
      type: Boolean,
      default: false
    },
    // 聚焦输入框时才显示后置内容
    appendFocusShow: {
      type: Boolean,
      default: false
    },
    // 搜索条件无匹配时显示的文字
    emptyText: {
      type: String,
      default: '无数据'
    },
    // 下拉框的类名
    popperClass: {
      type: String,
      default: undefined
    },
    // 嵌入element表格时单元格padding设为0
    noTableCellPadding: {
      type: Boolean,
      default: false
    },
    // 选择后触发键盘方向右键
    arrowRightAfterSelect: {
      type: Boolean,
      default: false
    },
    // 键盘回车键触发键盘方向右键
    arrowRightWhenEnter: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      popoverVisible: false, // 控制弹出框是否展示

      inputText: null, // 输入框显示内容
      inputValue: null, // 输入框实际值
      inputElement: null, // 存储输入框元素
      debounceTimeout: null, // 输入框输入防抖定时器
      isClear: false, // 输入框清空按钮操作标记，清空操作时弹出框不打开
      popoverWidth: 0, // 弹出框宽度
      popoverFocus: false, // 弹出框是否为聚焦状态
      validateEvent: true, // 输入框失焦是否自动验证

      allTableData: [], // 存储上次已请求的表格数据
      tableColumn: [], // 表格表头数据
      tableData: [], // 当前筛选条件下的表格数据
      currentRow: {}, // 存储当前选择行
      currentRowIndex: null, // 存储当前高亮选择行的下标
      hoverRowIndex: null, // 存储鼠标当前悬浮行的下标
      hasChosen: false, // 标记鼠标选中操作
      keyboardOperating: false // 键盘操作标记，键盘操作时暂停鼠标悬浮事件的回调
    }
  },
  computed: {
    // 输入框不同size对应高度
    inputHeight: function () {
      switch (this.size) {
        case 'mini': return '28px'
        case 'small': return '32px'
        case 'medium': return '36px'
        default: return '40px'
      }
    }
  },
  watch: {
    // 监听输入框值变化（ 需放在value的watch监听前面，事先注册，初始化时inputValue变化才会被监听到 ）
    inputValue: {
      handler(newValue) {
        if (newValue !== null && newValue !== '') {
          this.setInputText(newValue)
          if (!this.inputText) {
            this.inputText = newValue // 暂时将新数值设为请求的搜索条件，以便下一步进行初始化数据
            this.initTableData().then(() => { this.setInputText(newValue) })
          }
        } else {
          this.inputText = null
        }
        this.$emit('change', this.inputValue) // 暴露出v-model

        // 触发ElFormItem表单校验
        this.dispatchValidate('ElFormItem', 'el.form.blur', [this.inputValue])
      }
    },
    // 监听外部v-model传进来的值
    value: {
      handler(newValue, oldValue) {
        // 输入框刚渲染时无需请求
        if (typeof(oldValue) === 'undefined' && (newValue === null || newValue === '')) return
        if (this.valueChangeImmediate) {
          // 无防抖，即时同步更新inputValue
          this.inputValue = newValue
        } else {
          // 防抖处理
          if (this.debounceTimeout !== null){
            clearTimeout(this.debounceTimeout)
            this.debounceTimeout = null
          }
          if (!this.valueChangeImmediate)
            this.debounceTimeout = setTimeout(() => { this.inputValue = newValue }, 500)
        }
      },
      immediate: true
    },
    // 触发弹出框位置的刷新
    tableData: {
      handler(newValue, oldValue) {
        if (this.popoverVisible) {
          this.popoverVisible = false
          this.$nextTick(()=>{
            this.popoverVisible = true
          })
        }
      }
    },
    // 直接传入的表格数据有变化时刷新表格相关数据
    data: {
      handler() {
        this.initTableData().then(() => { this.setInputText(this.inputValue) })
      }
    }
  },
  mounted() {
    if (this.$refs['selectInput']) this.inputElement = this.$refs['selectInput'].$el
    this.setInputBorder() // 初始化输入框边框和前后内置slot元素
    if (this.noTableCellPadding) this.setTableCellPadding() // 嵌入表格时将单元格padding设为0
    this.setPopoverListener('on') // 监听弹出框的点击事件
  },
  beforeDestroy() {
    this.setPopoverListener('off') // 移除弹出框的点击事件
  },
  methods: {
    // 初始化弹出框表格数据
    async initTableData() {
      await this.getTableData().then(async (data) => {
        for (let key in data.view) {
          let hasItem = false
          this.tableColumn.forEach(tableColumnItem => {
            hasItem = tableColumnItem[this.columnKey.key] === data.view[key][this.columnKey.key] || hasItem
          })
          if (!hasItem) this.tableColumn.push(data.view[key])
        }
        if (this.columnKey.orderKey) this.sortArr(this.tableColumn, this.columnKey.orderKey) // 表头排序
        await this.setAllTableData(data.body)
        this.setTableData(this.allTableData)
        this.setPopoverWidth()
      })
    },
    // 获取下拉表格数据
    async getTableData() {
      let data = Object.assign({}, this.data)
      if (this.getDataFunction) {
        let params = Object.assign({}, this.baseRequestParams )
        params[this.requestKey] = this.inputText ? this.inputText.trim() : '' // 去掉前后空格
        await this.getDataFunction(params).then(async (res) => {
          // console.log('请求了一次数据');
          if (res.code === this.requestSuccessCode ? this.requestSuccessCode : 1001 && res.data) {
            data = Object.assign({}, res.data)
          }
        }).catch(err => { console.error(err) })
      }
      return data
    },
    // 存储已请求的数据
    setAllTableData(newData) {
      // 本地只存储上一次搜索
      this.allTableData = newData ? [...newData] : []

      // 本地存储所有搜索过的结果
      // this.allTableData = this.allTableData.concat(newData)
      // let obj = {};
      // this.allTableData = this.allTableData.reduce((item, next) => {
      //   obj[next[this.rowKey.key]] ? '' : (obj[next[this.rowKey.key]] = true) && item.push(next)
      //   return item;
      // }, []);
    },
    // 设置表格数据
    setTableData(newData) {
      if (newData.length > 0) {
        this.tableData = [...newData]
        if (this.rowKey.orderKey) this.sortArr(newData, this.rowKey.orderKey) // 表内容排序表内容排序
        if (this.hoverRowIndex && this.hoverRowIndex + 1 <= newData.length) return // 新数据长度大于鼠标正悬浮的行位置时，无需重置当前选择行
        this.currentRowIndex = 0
        this.currentRow = this.tableData[this.currentRowIndex]
        this.$refs['selectTable'].setCurrentRow(this.tableData[this.currentRowIndex])
      } else {
        this.tableData = []
        this.currentRowIndex = null
        this.currentRow = null
        this.$refs['selectTable'].setCurrentRow()
      }
    },

    // 输入框值变化时设置输入框显示的文字
    setInputText(newValue) {
      this.inputText = null
      if (this.allTableData) {
        this.allTableData.forEach(item => {
          // if (item[this.rowKey.key] === newValue) { // 匹配时严格大小写
          if (item[this.rowKey.key] && newValue && item[this.rowKey.key].trim() === newValue.trim()) { // 匹配时去除前后空格
            // if (item[this.rowKey.key].trim().toLowerCase() === newValue.trim().toLowerCase()) { // 匹配时大小写不严格
            this.inputText = item[this.rowKey.labelKey]
            this.currentRow = item
          }
        })
      }
    },
    // 输入框输入事件回调
    handleInput(text) {
      this.keyboardOperating = false // 取消键盘操作标记
      this.validateEvent = !text // 有输入值时关闭输入框自动验证，无输入值时开启自动验证
      if (this.debounceTimeout !== null){
        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = null
      }
      this.debounceTimeout = setTimeout(() => { this.filterMethod(text) }, 500) // 防抖
      this.$emit('input', text)
    },
    // 输入框输入后的搜索事件
    async filterMethod(inputText) {
      let text = inputText ? inputText.trim() : '' // 去掉两端空格
      if (text) {
        let newTableData = this.generateNewTableData(text)
        if (newTableData.length === 0) {
          // 本地查无数据时请求多一次
          await this.initTableData()
          newTableData = this.generateNewTableData(text)
        }
        this.setTableData(newTableData)
      } else {
        this.setTableData(this.allTableData)
      }
      if (this.isClear) {
        this.isClear = false
      } else {
        this.popoverVisible = true
      }
    },
    // 初始化将要赋值给tableData的数组
    generateNewTableData(text) {
      let newTableData = []
      this.allTableData.forEach(dataItem => {
        if (this.tableColumn.some(propItem => {
          return dataItem[propItem[this.columnKey.key]] ?
            dataItem[propItem[this.columnKey.key]].toLowerCase().indexOf(text.toLowerCase()) !== -1 : false
        })) newTableData.push(dataItem)
      })
      return newTableData
    },

    // 输入框失焦事件回调
    inputBlur(e) {
      if (this.debounceTimeout !== null){
        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = null
      }
      // 弹出框已被鼠标点击事件或键盘回车事件关闭时，无需再次设置数据
      if (this.popoverVisible) {
        setTimeout(() => { this.handleChosen(true) }, 0)
      } else {
        if ((!this.inputText || this.inputText === '') && !this.hasChosen) {
          this.inputValue = null
        } else {
          let correspondItem = this.tableData.find(item => { return item[this.rowKey.key] === this.inputValue }) || {}
          this.inputText = JSON.stringify(correspondItem) !== '{}' ? correspondItem[this.rowKey.labelKey] : null
        }
      }
      setTimeout(()=>{
        if (!this.popoverFocus) {
          if (this.prependFocusShow) this.inputElement.classList.add('hidePrepend')
          if (this.appendFocusShow) this.inputElement.classList.add('hideAppend')
          this.$emit('blur', e)
        }
      },0)
    },
    // 输入框聚焦事件回调
    inputFocus(e) {
      if (this.prependFocusShow && !this.disabled) this.inputElement.classList.remove('hidePrepend')
      if (this.appendFocusShow && !this.disabled) this.inputElement.classList.remove('hideAppend')
      this.$emit('focus', e)
    },
    // 输入框清空事件回调
    inputClear(e) {
      this.currentRow = null
      this.inputValue = null
      this.isClear = true
      this.popoverVisible = false
      this.$emit('clear', e)
      this.$refs['selectInput'].focus() // 清空后聚焦输入框
    },
    // 输入框键盘方向左键回调
    keyboardLeft(e) {
      if (!this.inputText ||
        (typeof(e.target.selectionStart) !== "undefined" && e.target.selectionStart - 1 < 0) &&
        (typeof(e.target.selectionEnd) !== "undefined" && e.target.selectionEnd === e.target.selectionStart)) {
        this.$emit('keyDownLeft', e)
      }
    },
    // 输入框键盘方向右键回调
    keyboardRight(e) {
      if (this.hasChosen || !this.inputText ||
        (typeof(e.target.selectionEnd) !== "undefined" && e.target.selectionEnd + 1 > this.inputText.length) &&
        (typeof(e.target.selectionStart) !== "undefined" && e.target.selectionStart === e.target.selectionEnd)) {
        this.$emit('keyDownRight', e)
      }
    },
    // 输入框键盘方向上键回调
    keyboardUp(e) {
      if (this.popoverVisible) return
      this.$emit('keyDownUp', e)
    },
    // 输入框键盘方向下键回调
    keyboardDown(e) {
      if (this.popoverVisible) return
      this.$emit('keyDownDown', e)
    },
    // 输入框键盘回车键回调
    keyboardEnter(e) {
      if (this.popoverVisible) return
      if (this.arrowRightWhenEnter)this.keyboardRightSimulation()
      this.$emit('keyDownEnter', e)
    },

    // 设置弹出框的宽度
    setPopoverWidth() {
      this.popoverWidth = 0
      this.tableColumn.forEach(item => {
        this.popoverWidth += + item.width || 0 // 表格数据总宽度，后面需要加上表格border和弹出框padding
      })
      let maxWidth = this.tableMaxWidth
      if (typeof(this.tableMaxWidth) === 'string') maxWidth = + this.tableMaxWidth.replace(/[^0-9]/ig,"")
      // 28px是表格的border及弹出框的padding
      this.popoverWidth = (this.popoverWidth > + maxWidth ? + maxWidth : this.popoverWidth) + 28
    },
    // 初始化弹出框监听事件
    setPopoverListener(type) {
      if (!this.$refs['tablePopover']) return //不存在则返回
      let currentPopover = this.$refs['tablePopover'].$el.querySelector('.el-popover')
      if ( !currentPopover ) return
      if(type === 'on') {
        currentPopover.addEventListener('focus', this.popoverFocusCallback, true)
      } else {
        currentPopover.removeEventListener('focus', this.popoverFocusCallback)
      }
    },
    // 弹出框聚焦事件回调
    popoverFocusCallback() {
      this.popoverFocus = true
      setTimeout(() => {
        this.$refs['selectInput'].focus()
        this.popoverFocus = false
        // this.hasChosen = false
      }, 0)
    },

    // 表格鼠标悬浮单元格事件回调
    hoverRow(row) {
      // 键盘操作时无需触发hover的赋值
      if (this.keyboardOperating) {
        this.keyboardOperating = false // 取消键盘操作标记
      } else {
        this.hoverRowIndex = this.tableData.indexOf(row)
        this.currentRowIndex = this.hoverRowIndex
        this.currentRow = row
        this.$refs['selectTable'].setCurrentRow(row)
      }
    },
    // 表格鼠标离开单元格事件回调
    leaveRow(row) {
      this.hoverRowIndex = null
    },
    // 弹出框表格行点击
    tableRowClick(row) {
      // 重新设置表格数据
      this.handleChosen(false)
      // 点击选择后，隐藏弹出框
      this.popoverVisible = false

      if (this.debounceTimeout !== null){
        clearTimeout(this.debounceTimeout)
        this.debounceTimeout = null
      }
      // this.$refs['selectInput'].blur()
    },
    // 确认选中项
    handleChosen(isBlur) {
      if (this.popoverFocus) return
      if (((!this.inputText || (this.inputText && this.inputText.trim() === '')) && isBlur)
        || ((!this.currentRow || JSON.stringify(this.currentRow) === '{}') && this.inputText && this.inputText.trim() !== '')) {
        // 输入框没有值 或 输入框有值但无匹配的表格选中行
        this.inputValue = null
        this.inputText = null // 清空搜索框输入值
      } else if (this.currentRow && JSON.stringify(this.currentRow) !== '{}') {
        // 输入框有值且表格有选中行
        // 新值与旧值相同时，watch监听不到inputValue变化，则手动改写text
        if (this.inputValue === this.currentRow[this.rowKey.key]) this.inputText = this.currentRow[this.rowKey.labelKey]
        this.inputValue = this.currentRow[this.rowKey.key]
      }
      this.currentRow = null
      this.popoverVisible = false

      // 选择完成后模拟键盘方向右键
      if (!isBlur && this.arrowRightAfterSelect) this.keyboardRightSimulation()
    },
    // 模拟键盘方向右键
    keyboardRightSimulation() {
      this.hasChosen = true
      let keydownRight = document.createEvent('Event')
      keydownRight.initEvent('keydown', true, false)
      keydownRight = Object.assign(keydownRight, {
        which: 39,
        keyCode: 39,
        key: 'ArrowRight',
        code: 'ArrowRight',
      })
      this.keyboardRight(keydownRight)
      this.hasChosen = false
    },

    // 弹出框键盘回车键回调
    enterSelect() {
      this.keyboardOperating = true
      if (this.currentRow && this.popoverVisible) {
        this.tableRowClick(this.currentRow)
      }
    },
    // 弹出框键盘方向下键回调
    downSelect() {
      this.keyboardOperating = true
      if (this.tableData.length > 0 && this.currentRowIndex < this.tableData.length - 1) {
        this.currentRowIndex = this.currentRowIndex + 1
        this.currentRow = this.tableData[this.currentRowIndex]
        this.$refs['selectTable'].setCurrentRow(this.currentRow)
        this.$nextTick(() => {
          this.setScrollBar('down')
        })
      }
    },
    // 弹出框键盘方向上键回调
    upSelect() {
      this.keyboardOperating = true
      if (this.tableData.length > 0 && this.currentRowIndex > 0) {
        this.currentRowIndex = this.currentRowIndex - 1
        this.currentRow = this.tableData[this.currentRowIndex]
        this.$refs['selectTable'].setCurrentRow(this.currentRow)
        this.$nextTick(() => {
          this.setScrollBar('up')
        })
      }
    },

    // 设置表格滚动条滚动位置
    setScrollBar(type) {
      if (!this.$refs['selectTable']) return //不存在这个表格则返回
      let elTable = this.$refs['selectTable'].$el
      if ( !elTable ) return
      let scrollParent = elTable.querySelector('.el-table__body-wrapper')
      let currentRowElement = elTable.querySelector('.current-row')
      if (type === 'down' && scrollParent.scrollTop > currentRowElement.offsetTop) {
        // 方向下时当前元素在可视区域上方
        // scrollParent.scrollTop = currentRowElement.offsetTop
        scrollParent.scrollTo({
          top: currentRowElement.offsetTop,
          behavior: 'smooth'
        })
        return
      } else if (type === 'down' && currentRowElement.offsetTop + currentRowElement.offsetHeight > scrollParent.offsetHeight) {
        // 方向下时当前元素在可视区域下方
        // scrollParent.scrollTop = currentRowElement.offsetTop + currentRowElement.offsetHeight - scrollParent.offsetHeight
        scrollParent.scrollTo({
          top: currentRowElement.offsetTop + currentRowElement.offsetHeight - scrollParent.offsetHeight,
          behavior: 'smooth'
        })
        return
      } else if (type === 'up' && scrollParent.scrollTop > currentRowElement.offsetTop) {
        // 方向上时当前元素在可视区域上方
        // scrollParent.scrollTop = currentRowElement.offsetTop
        scrollParent.scrollTo({
          top: currentRowElement.offsetTop,
          behavior: 'smooth'
        })
        return
      } else if (type === 'up' && scrollParent.scrollTop + scrollParent.offsetHeight < currentRowElement.offsetTop) {
        // 方向上时当前元素在可视区域下方
        // scrollParent.scrollTop = currentRowElement.offsetTop - scrollParent.offsetHeight + currentRowElement.offsetHeight
        scrollParent.scrollTo({
          top: currentRowElement.offsetTop - scrollParent.offsetHeight + currentRowElement.offsetHeight,
          behavior: 'smooth'
        })
        return
      }
    },
    // 对象数组排序（ 用于表头数据和表内容数据的排序 ）
    sortArr(arr, orderKey) {
      // if (orderKey) {
      arr.sort(function(obj1, obj2) {		// 这里传入两个參数用于比較
        let temp1 = obj1[orderKey]
        let temp2 = obj2[orderKey]
        if (temp1 < temp2) { return -1 }
        else if (temp1 > temp2) { return 1 }
        else { return 0 }
      })
      // }
    },
    // 初始化输入框边框和前后内置slot元素
    setInputBorder() {
      if (!this.inputElement) return
      if (this.prependFocusShow) this.inputElement.classList.add('hidePrepend')
      if (this.appendFocusShow) this.inputElement.classList.add('hideAppend')
      if (!this.disabled) {
        this.inputElement.classList.add('showPrepend')
        this.inputElement.classList.add('showAppend')
      }
      let elInputInner = this.inputElement.querySelector('.el-input__inner')
      let elInputPrepend = this.inputElement.querySelector('.el-input-group__prepend')
      let elInputAppend = this.inputElement.querySelector('.el-input-group__append')
      if (this.noBorder) {
        elInputInner.style.border = "none"
        elInputInner.style.borderRadius = "0"
        if (elInputPrepend) {
          elInputPrepend.style.border = "none"
          elInputPrepend.style.borderRight = "1px solid rgb(220, 223, 230)"
          elInputPrepend.style.borderRadius = "0"
        }
        if (elInputAppend) {
          elInputAppend.style.border = "none"
          elInputAppend.style.borderLeft = "1px solid rgb(220, 223, 230)"
          elInputAppend.style.borderRadius = "0"
        }
      }
      if (this.prependFocusShow) elInputPrepend.classList.add('slot-bounce-show')
      if (this.appendFocusShow) elInputAppend.classList.add('slot-bounce-show');
    },
    // 找到单元格元素并将单元格padding设为0
    setTableCellPadding() {
      let cellElement = this.$refs['tableWrapper'].parentElement
      // 循环找到cell元素
      while (cellElement && (!cellElement.classList || !cellElement.classList.contains('cell'))) {
        cellElement = cellElement.parentElement
      }
      if (cellElement) {
        cellElement.style.padding = '0'
        cellElement.parentElement.style.padding = '0'
      }
    },
    // 触发ElFormItem表单校验函数
    dispatchValidate(componentName, eventName, params) {
      let parent = this.$parent || this.$root
      let name = parent.$options.componentName
      // 循环找到ElFormItem父组件
      while (parent && (!name || name !== componentName)) {
        parent = parent.$parent
        if (parent) name = parent.$options.componentName
      }
      if (parent) parent.$emit.apply(parent, [eventName].concat(params))
    }
  }
}
</script>
<style lang="scss">
.el-table.selectTable {
  .el-table__header thead tr th {
    background: #EEEEEE;
    color: #333;
  }
  .el-table__body-wrapper {
    .el-table__body tbody tr td {
      cursor: pointer;
    }
    /*取消鼠标悬浮时行颜色*/
    .el-table__body tr:hover>td{
      background: none;
    }
    /*表格当前行颜色*/
    .el-table__body tr.current-row > td{
      background: #E3F5FF;
      /*background: #E8F4FF;*/
    }
  }

  /*滚动条宽度*/
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  ::-webkit-scrollbar-track {
    border-radius: 4px; /*滚动条的背景区域的圆角*/
    -webkit-box-shadow: inset 0 0 5px rgba(238,238,238, 0.3);
    background-color: #f7f7f7; /*滚动条背景区域的背景颜色*/
  }
  ::-webkit-scrollbar-thumb {
    border-radius: 4px; /*滚动条的圆角*/
    -webkit-box-shadow: inset 0 0 5px rgba(145, 143, 143, 0.3);
    background-color: #e7e7e7; /*滚动条的背景颜色*/
  }
  ::-webkit-scrollbar-thumb:hover {
    background-color: #c7c7c7; /*滚动条的背景颜色*/
  }

  /*修复表格表头错位问题*/
  //::v-deep th.gutter, ::v-deep colgroup.gutter {
  //  width: 8px !important;
  //}
  .el-table__header-wrapper .el-table__header thead tr .gutter,
  .el-table__header-wrapper .el-table__header colgroup .gutter {
    width: 8px !important;
  }
  .el-table__body-wrapper .el-table__body tbody tr .gutter,
  .el-table__body-wrapper .el-table__body colgroup .gutter {
    width: 8px !important;
  }
  .el-table__header colgroup col[name="gutter"] {
    display: table-cell !important;
  }
}
.input-select-popover {
  .selectInput {
    height: 100%;
    .el-input__inner {
      height: 100%;
    }
    .el-input-group__prepend, .el-input-group__append {
      height: 100%;
    }
    /*前后内置内容垂直居中*/
    .el-input__prefix, .el-input__suffix {
      display: flex;
      align-items: center;
    }
  }

  .hidePrepend{
    .el-input__inner {
      border-radius: 4px;
    }
    .el-input-group__prepend {
      display: none;
    }
  }
  .hideAppend {
    .el-input__inner {
      border-radius: 4px;
    }
    .el-input-group__append {
      display: none;
    }
  }
  .showPrepend:hover {
    .el-input-group__prepend {
      display: table-cell;
    }
  }
  .showAppend:hover {
    .el-input-group__append {
      display: table-cell;
    }
  }
}

/*前后置元素动画*/
@keyframes slot-bounce-show { 0% {transform: scale(0);} 75% {transform: scale(1.2);} 100% {transform: scale(1);} }
@-webkit-keyframes slot-bounce-show { 0% {transform: scale(0);} 75% {transform: scale(1.2);} 100% {transform: scale(1);} }
@-moz-keyframes slot-bounce-show { 0% {transform: scale(0);} 75% {transform: scale(1.2);} 100% {transform: scale(1);} }
.slot-bounce-show {
  animation: slot-bounce-show .2s ease;
  -webkit-animation: slot-bounce-show .2s ease;
  -moz-animation: slot-bounce-show .2s ease;
}
</style>
