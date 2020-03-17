<template>
  <div :class="b()">
    <div v-if="type==='tree'"
         v-clickout="closeBox"
         :class="b('content')">
      <el-input :size="size"
                v-model="labelShow"
                :type="typeParam"
                :clearable="disabled?false:clearable"
                :autosize="{ minRows: minRows, maxRows: maxRows}"
                :prefix-icon="prefixIcon"
                :suffix-icon="suffixIcon"
                :placeholder="placeholder"
                :show-word-limit="showWordLimit"
                @change="handleChange"
                @focus="handleFocus"
                @blur="handleBlur"
                :disabled="disabled"
                @click.native="disabled?'':open()" />
      <div :class="b('tree')"
           v-if="box"
           :style="treeStyle">
        <div :class="b('arrow')"></div>
        <el-input size="mini"
                  style="margin-bottom:8px;"
                  placeholder="输入关键字进行过滤"
                  v-model="filterText"
                  v-if="filter"></el-input>
        <el-scrollbar style="height:180px;overflow-x:hidden">
          <el-tree :data="dicList"
                   :node-key="valueKey"
                   :accordion="accordion"
                   :show-checkbox="multiple"
                   :props="props"
                   :check-strictly="checkStrictly"
                   ref="tree"
                   check-on-click-node
                   highlight-current
                   :current-node-key="multiple?'':text"
                   @check="checkChange"
                   :filter-node-method="filterNode"
                   :default-expanded-keys="defaultExpandAll?keysList:[]"
                   :default-checked-keys="keysList"
                   :default-expand-all="defaultExpandAll"
                   @node-click="handleNodeClick">
            <div class="el-tree-node__bee__label" style="width:100%;padding-right:10px;position:relative"
                 slot-scope="{ data }">
              <slot :name="prop+'Type'"
                    :label="labelKey"
                    :value="valueKey"
                    :item="data"
                    v-if="typeslot"></slot>
              <span v-else>{{data[labelKey]}}</span>
            </div>
          </el-tree>
        </el-scrollbar>
      </div>
    </div>

    <el-input v-else-if="type==='search'"
              :size="size"
              :clearable="disabled?false:clearable"
              v-model="text"
              @click.native="handleClick"
              :type="typeParam"
              :maxlength="maxlength"
              :prefix-icon="prefixIcon"
              :suffix-icon="suffixIcon"
              :readonly="readonly"
              @keyup.enter="appendClick()"
              :placeholder="placeholder"
              :show-word-limit="showWordLimit"
              @change="handleChange"
              @focus="handleFocus"
              @blur="handleBlur"
              :disabled="disabled">
      <el-button slot="append"
                 icon="el-icon-search"
                 @click="appendClick()"></el-button>
    </el-input>
    <el-input v-else
              :size="size"
              :clearable="disabled?false:clearable"
              v-model="text"
              @click.native="handleClick"
              :type="typeParam"
              :maxlength="maxlength"
              :minlength="minlength"
              :autosize="{ minRows: minRows, maxRows: maxRows}"
              :prefix-icon="prefixIcon"
              :suffix-icon="suffixIcon"
              :readonly="readonly"
              :placeholder="placeholder"
              :show-word-limit="showWordLimit"
              @change="handleChange"
              @focus="handleFocus"
              @blur="handleBlur"
              :disabled="disabled"
              :autocomplete="autocomplete">
      <template slot="prepend"
                v-if="prepend"><span @click="prependClick()">{{prepend}}</span>
      </template>
      <template slot="append"
                v-if="append"><span @click="appendClick()">{{append}}</span></template>
    </el-input>
  </div>
</template>

<script>
import create from "core/create";
import props from "../../core/common/props.js";
import event from "../../core/common/event.js";
import { DIC_PROPS, DIC_SPLIT } from 'global/variable';
import { findLabelNode } from 'utils/util'
import { validatenull } from "utils/validate";
import Treeselect from '@riophae/vue-treeselect'
export default create({
  name: "input",
  mixins: [props(), event()],
  components: { Treeselect },
  data () {
    return {
      treeStyle: {
        left: 0,
        top: 0,
      },
      node: {},
      voidkey: null,
      filterText: "",
      box: false,
      labelText: this.multiple ? [] : ""
    };
  },
  props: {
    nodeClick: Function,
    checked: Function,
    value: {},
    maxlength: "",
    minlength: "",
    showWordLimit: {
      type: Boolean,
      default: false
    },
    filter: {
      type: Boolean,
      default: true
    },
    checkStrictly: {
      type: Boolean,
      default: false
    },
    accordion: {
      type: Boolean,
      default: false
    },
    parent: {
      type: Boolean,
      default: true
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    prefixIcon: {
      type: String
    },
    suffixIcon: {
      type: String
    },
    prependClick: {
      type: Function,
      default: () => { }
    },
    prepend: {
      type: String
    },
    appendClick: {
      type: Function,
      default: () => { }
    },
    append: {
      type: String
    },
    minlength: {
      type: Number
    },
    maxlength: {
      type: Number
    },
    minRows: {
      type: Number,
      default: 5
    },
    maxRows: {
      type: Number,
      default: 10
    },
    autocomplete: {
      type: String
    },
    limit: {
      type: Number,
      default: Infinity
    },
    branchNode: {
      type: Boolean,
      default: false
    },
    showCount: {
      type: Boolean,
      default: false
    },
    valueConsistsOf: {
      type: String,
      default: 'BRANCH_PRIORITY'
    }
  },
  watch: {
    text: {
      handler (a, b) {
        this.handleChange(a);
      },
      immediate: true
    },
    value () {
      this.initVal();
      this.init();
    },
    filterText (val) {
      this.$refs.tree.filter(val);
    }
  },
  computed: {
    dicListSel () {
      function addParent (result, parent) {
        result.forEach(ele => {
          const children = ele.children;
          if (children) {
            addParent(children, ele);
          }
          if (parent) {
            ele.$parent = parent;
          }
        });
      }
      let list = this.dic;
      addParent(list);

      console.log(list)
      return list;
    },
    dicList () {
      function addParent (result, parent) {
        result.forEach(ele => {
          const children = ele.children;
          if (children) {
            addParent(children, ele);
          }
          if (parent) {
            ele.$parent = parent;
          }
        });
      }
      let list = this.dic;
      addParent(list);
      return list;
    },
    keysList () {
      // lsc: 多选树，子级父级一起选中
      if(this.voidkey) {
        return this.multiple ? this.voidkey : [];
      } else {
        let tx = [...this.text]
        const valueKey = this.valueKey
        function DICLIST(data) {
          data.forEach((node,index) => {
            for(let key in node){
              if(key == "children"){
                tx = tx.filter(t => t!==node[valueKey])
                DICLIST(node.children)
              }
            }
          })
        }
        DICLIST(this.dicList)
        return this.multiple ? tx : [];
      }
      // return this.multiple ? (this.voidkey ? this.voidkey : this.text) : [];
    },
    isTree () {
      return this.type === "tree";
    },
    labelShow: {
      get: function () {
        if (this.validatenull(this.value)) {
          return ''
        } else if (this.multiple) {
          return (this.labelText || []).join(DIC_SPLIT).toString()
        }
        return this.getLabelText(this.node);
      },
      set: function () {
      }
    },
    textShow () {
      if (this.textLen === 11)
        return `${this.text.substr(0, 3)} ${this.text.substr(
          3,
          4
        )} ${this.text.substr(7, 4)}`;
      return this.text;
    },
    textLen () {
      return (this.text || "").length || 0;
    },
    typeParam: function () {
      if (this.type === "textarea") {
        return "textarea";
      } else if (this.type === "password") {
        return "password";
      } else {
        return "text";
      }
    }
  },
  mounted () {
    this.init();
  },
  methods: {
    closeBox () {
      this.box = false
    },
    filterNode (value, data) {
      if (!value) return true;
      return data[this.labelKey].indexOf(value) !== -1;
    },
    checkChange (checkedNodes, checkedKeys, halfCheckedNodes, halfCheckedKeys) {
      // lsc: 多选树，子级父级一起选中
      // 1. 先合并选中／半选中节点Id，请求传给后台。
      let tempKey=''
      this.voidkey = this.$refs.tree.getCheckedKeys()
      let newarrr = [].concat(this.$refs.tree.getHalfCheckedKeys(), [tempKey], this.$refs.tree.getCheckedKeys())

      // 2. 给tree绑定数据时，通过tempKey移除之前添加的半选中状态节点Id。
      newarrr = newarrr.filter(item => item!=='' )
      // 3. 给值排序（从小到大）
      let iMin = newarrr.sort((a,b)=>{return a-b;})
      const result =
        this.isString && this.multiple ? iMin.join(",") : iMin;
      this.$emit("input", result);
      this.$emit("change", result);

      // 原代码
      // this.text = [];
      // this.labelText = [];
      // const list = checkedKeys.checkedNodes;
      // list.forEach(node => {
      //   if (validatenull(node[this.childrenKey]) && !this.checkStrictly) {
      //     this.text.push(node[this.valueKey]);
      //     this.labelText.push(node[this.labelKey]);
      //   } else if (this.checkStrictly) {
      //     this.text.push(node[this.valueKey]);
      //     this.labelText.push(node[this.labelKey]);
      //   }
      // });
      // if (typeof this.checked === "function") this.checked(checkedNodes);
      // const result =
      //   this.isString && this.multiple ? this.text.join(",") : this.text;
      // this.$emit("input", this.text);
      // this.$emit("change", this.text);
    },
    open () {
      const height = this.$el.offsetHeight;
      const width = this.$el.getBoundingClientRect().width;
      const left = this.$el.getBoundingClientRect().left;
      const top = this.$el.getBoundingClientRect().top;
      this.treeStyle = {
        top: this.setPx(height),
        top: this.setPx(top + height),
        left: this.setPx(left),
        width: this.setPx(width),
      }
      this.treeStyle
      this.box = true;
      this.handleClick();
    },
    init () {
      if (this.isTree) {
        if (this.multiple) {
          this.labelText = [];
        } else {
          this.labelText = "";
        }
        const check = setInterval(() => {
          if (validatenull(this.dic)) {
            this.labelText = "";
            clearInterval(check);
            return;
          }
          //是否禁止父类
          !this.parent && this.disabledParentNode(this.dic);
          if (this.multiple) {
            this.labelText = [];
            if (!validatenull(this.text)) {
              this.text.forEach(ele => {
                //特殊处理0
                ele = validatenull(ele) ? 0 : ele;
                const label = findLabelNode(this.dic, ele, this.props) || ele;
                this.labelText.push(label)
              });
            }
          } else {
            this.labelText = "";
            if (!validatenull(this.text)) {
              this.labelText = this.text;
              const label = findLabelNode(this.dic, this.text, this.props) || this.text;
              this.node = {}
              this.node[this.labelKey] = label
              this.labelText = label
            }
          }
          setTimeout(() => {
            this.$partent && this.$partent.$parent.clearValidate();
          }, 0);
          clearInterval(check);
        }, 500);
      }
    },
    disabledParentNode (dic) {
      dic.forEach(ele => {
        const children = ele[this.childrenKey];
        if (!validatenull(children)) {
          ele.disabled = true;
          this.disabledParentNode(children);
        }
      });
    },
    handleNodeClick (data, node) {
      // this.childNodesChange(node);
      // this.parentNodesChange(node);

        const callback = () => {
          this.box = false;
          this.node = data;
        };
        if (typeof this.nodeClick === "function") this.nodeClick(data);
        if (this.multiple) return;
        if (
          (validatenull(data[this.childrenKey]) && !this.multiple) ||
          this.parent
        ) {
          const value = data[this.valueKey];
          const label = data[this.labelKey];
          const result = this.isString && this.multiple ? value.join(",") : value;
          this.text = value;
          this.labelText = label;
          this.$emit("input", result);
          this.$emit("change", result);
          callback();
        }

    },
    childNodesChange(node){
      let len = node.childNodes.length;
      for(let i = 0; i < len; i++){
        node.childNodes[i].checked = false;
        this.childNodesChange(node.childNodes[i]);
      }   
    },
    parentNodesChange(node){
      if(node.parent){
        for(let key in node){
          if(key == "parent"){
            node[key].checked = true;
            this.parentNodesChange(node[key]);
          }
        }
      }      
    },
    handleClick () {
      const result =
        this.isString && this.multiple ? this.text.join(",") : this.text;
      if (typeof this.click === "function")
        this.click({ value: result, column: this.column });
    },
    handleChange (value) {
      let text = this.text;
      const result = this.isString && this.multiple ? value.join(",") : value;
      if (typeof this.change === "function") {
        this.change({ value: result, column: this.column });
      }
      this.$emit("input", result);
      this.$emit("change", result);
    }
  }
});
</script>

