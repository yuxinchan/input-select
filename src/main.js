import Vue from 'vue'
// import ElementUI from 'element-ui';
// import 'element-ui/lib/theme-chalk/index.css';
// Vue.use(ElementUI);
import App from './App.vue'
import { Popover, Table, TableColumn, Input } from 'element-ui';
// import { Popover, Table, TableColumn, Input, Button, Form, FormItem, Dialog } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import inputSelect from './lib/index.js'
Vue.use(Popover);
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Input);
// Vue.use(Button);
// Vue.use(Form);
// Vue.use(FormItem);
// Vue.use(Dialog);
Vue.use(inputSelect)
new Vue({
  el: '#app',
  render: h => h(App)
})
