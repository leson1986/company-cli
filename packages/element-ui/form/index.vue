<template>
  <div :class="b()"
       :style="{width:setPx(parentOption.formWidth,'100%')}">
    <el-form ref="form"
             status-icon
             :model="form"
             label-suffix=":"
             :label-position="parentOption.labelPosition"
             :size="controlSize"
             :label-width="setPx(parentOption.labelWidth,90)"
             :rules="formRules">
      <el-row :span="24">
        <avue-group v-for="(item,index) in columnOption"
                    :key="item.prop"
                    :display="item.display"
                    :icon="item.icon"
                    :card="parentOption.card"
                    :label="item.label">
          <template slot="header"
                    v-if="$slots[item.prop+'Header']">
            <slot :name="item.prop+'Header'"></slot>
          </template>
          <div :class="b('group')">
            <template v-if="vaildDisplay(column)"
                      v-for="(column,cindex) in item.column">
              <el-col :key="column.prop"
                      :style="{paddingLeft:setPx((parentOption.gutter ||20)/2),paddingRight:setPx((parentOption.gutter ||20)/2)}"
                      :md="column.span || itemSpanDefault"
                      :xs="24"
                      :offset="column.offset || 0"
                      :class="b('row')">
                <el-form-item :label="column.label"
                              :prop="column.prop"
                              :class="b('item--'+(column.labelPosition ||item.labelPosition || ''))"
                              :label-width="getLabelWidth(column,item)">
                  <el-tooltip :disabled="!column.tip || column.type==='upload'"
                              :content="vaildData(column.tip,getPlaceholder(column))"
                              :placement="column.tipPlacement">
                    <slot :value="form[column.prop]"
                          :column="column"
                          :label="form['$'+column.prop]"
                          :size="column.size || controlSize"
                          :disabled="vaildDisabled(column)"
                          :dic="DIC[column.prop]"
                          :name="column.prop"
                          v-if="column.formslot"></slot>
                    <form-temp :column="column"
                               v-else
                               :dic="DIC[column.prop]"
                               :t="t"
                               :props="parentOption.props"
                               :propsHttp="parentOption.propsHttp"
                               :upload-before="uploadBefore"
                               :upload-after="uploadAfter"
                               :disabled="vaildDisabled(column) || allDisabled"
                               v-model="form[column.prop]"
                               :enter="parentOption.enter"
                               @enter="submit"
                               @change="column.cascader?handleChange(item.column,cindex):handleChangeMore(item.column,cindex)">
                      <template :slot="column.prop+'Type'"
                                slot-scope="{item,label,value}"
                                v-if="column.typeslot">
                        <slot :name="column.prop+'Type'"
                              :item="item"
                              :value="value"
                              :label="label"></slot>
                      </template>
                    </form-temp>
                  </el-tooltip>
                </el-form-item>
              </el-col>
              <div :class="b('line')"
                   :key="cindex"
                   :style="{width:(column.count/24*100)+'%'}"
                   v-if="column.row && column.span!==24 && column.count"></div>
            </template>
          </div>
        </avue-group>

        <el-col :span="24"
                v-if="vaildData(parentOption.menuBtn,true)">
          <el-form-item>
            <!-- 菜单按钮组 -->
            <div :class="b('menu',[menuPosition])">
              <el-button type="primary"
                         @click="handleMock"
                         :size="controlSize"
                         icon="el-icon-edit-outline"
                         :loading="allDisabled"
                         v-if="isMock">填充数据</el-button>
              <el-button type="primary"
                         @click="submit"
                         :size="controlSize"
                         icon="el-icon-check"
                         :loading="allDisabled"
                         v-if="vaildData(parentOption.submitBtn,true)">{{vaildData(parentOption.submitText,'提 交')}}</el-button>
              <el-button icon="el-icon-refresh"
                         :size="controlSize"
                         :loading="allDisabled"
                         v-if="vaildData(parentOption.emptyBtn,true)"
                         @click="resetForm">{{vaildData(parentOption.emptyText,'重 置')}}</el-button>
              <slot name="menuForm"
                    :size="controlSize"></slot>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>

  </div>
</template>

<script>
import locale from "../../core/common/locale";
import { detail } from "core/detail";
import create from "core/create";
import init from "../../core/crud/init";
import formTemp from '../../core/components/form/index'
import { getComponent, getPlaceholder, formInitVal, calcCount, calcCascader } from "core/dataformat";
import { sendDic } from "core/dic";
import mock from "utils/mock";
export default create({
  name: "form",
  mixins: [init(), locale],
  components: {
    formTemp
  },
  data () {
    return {
      allDisabled: false,
      optionIndex: [],
      optionBox: false,
      tableOption: {},
      itemSpanDefault: 12,
      formOld: {},
      form: {},
      formList: [],
      formCreate: true,
      formDefault: {},
      formRules: {},
      getProp: [],
    };
  },
  watch: {
    form: {
      handler () {
        if (!this.formCreate) {
          // this.$emit("input", this.form);
          // this.$emit("change", this.form);
        } else {
          this.formCreate = false;
        }
      },
      deep: true
    },
    value: {
      handler () {
        this.formOld = this.deepClone(this.value);
        if (!this.formCreate) {
          this.formVal();
          this.$emit("input", this.form);
          this.$emit("change", this.form);
        }
      },
      deep: true
    }
  },
  computed: {
    propOption () {
      let list = [];
      this.columnOption.forEach(option => {
        option.column.forEach(column => {
          list.push(column);
        });
      });
      return list;
    },
    parentOption () {
      let option = this.deepClone(this.tableOption);
      let group = option.group;
      if (!group) {
        option = Object.assign(option, {
          group: [this.deepClone(option)]
        });
      }
      delete option.column;
      return option;
    },
    columnOption () {
      let list = [...this.parentOption.group] || [];
      list.forEach((ele, index) => {
        ele.column = ele.column || [];
        // 循环列的全部属性
        ele.column.forEach((column, cindex) => {
          //动态计算列的位置，如果为隐藏状态则或则手机状态不计算
          if (column.display !== false && !this.isMobile) {
            column = calcCount(column, this.itemSpanDefault, cindex === 0);
          }
        });
        //处理级联属性
        ele.column = calcCascader(ele.column);
      });
      return list;
    },
    menuPosition: function () {
      if (this.parentOption.menuPosition) {
        return this.parentOption.menuPosition;
      } else {
        return "center";
      }
    },
    boxType: function () {
      return this.parentOption.boxType;
    },
    isMock () {
      return this.vaildData(this.parentOption.mock, false);
    }
  },
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    uploadBefore: Function,
    uploadAfter: Function,
    value: {
      type: Object,
      required: true,
      default: () => {
        return {};
      }
    }
  },
  created () {
    this.$nextTick(()=> {
      // setTimeout(() => {
        // //初始化字典
        // this.columnOption.forEach(ele => {
        //   this.handleLoadDic(ele).then(res => {
        //     this.forEachLabel();
        //   });
        // });
      // }, 500);
      setTimeout(() => {
        // 初始化表单
        this.dataformat();
      }, 0);
    })
  },
  methods: {
    getComponent,
    getPlaceholder,
    forEachLabel () {
      // setTimeout(() => {
        this.columnOption.forEach(ele => {
          ele.column.forEach(column => {
            this.handleShowLabel(column, this.DIC[column.prop]);
          });
        });
      // }, 800);
    },
    getLabelWidth (column, item) {
      const result =
        column.labelWidth || item.labelWidth || this.parentOption.labelWidth;
      return this.setPx(result);
    },
    //获取全部字段字典的label
    handleShowLabel (column, DIC) {
        let result = "";
        if (!this.validatenull(DIC)) {
          result = detail(this.form, column, this.tableOption, DIC);
          this.$set(this.form, ["$" + column.prop], result);
        }
        return result;
    },
    //对部分表单字段进行校验的方法
    validateField (val) {
      return this.$refs.form.validateField(val);
    },
    //搜索指定的属性配置
    findColumnIndex (prop, group = false) {
      let list = [];
      let result;
      this.columnOption.forEach((column, index) => {
        const val = this.findArray(column.column, prop, "prop");
        if (val !== -1) {
          list.push(index);
          list.push(val)
          result = val;
        }
      });
      return group ? list : result
    },
    updateDic (prop, list) {
      const columnList = this.findColumnIndex(prop, true);
      const groupIndex = columnList[0];//分组序号
      const columnIndex = columnList[1];//列序号
      const column = this.columnOption[groupIndex].column[columnIndex];

      if (this.validatenull(list) && !this.validatenull(column.dicUrl)) {
        sendDic({
          url: column.dicUrl,
          resKey: (column.props || {}).res
        }).then(list => {
          this.$set(this.DIC, prop, list);
        });
      } else {
        this.$set(this.DIC, prop, list);
      }
    },
    dataformat () {
        //初始化字典
        this.columnOption.forEach(ele => {
          this.handleLoadDic(ele).then(res => {
            this.forEachLabel();
          });
        });
      setTimeout(() => {
        let formDefault = formInitVal(this.propOption);
        this.formDefault = formDefault;
        this.form = this.deepClone(formDefault.tableForm);
        this.formVal();
      }, 100);

    },

    handleChange (item, index) {
      this.handleChangeMore(item, index)
      setTimeout(() => {
        const column = item[index]; //获取当前节点级联
        const list = column.cascader;
        const specialSel = column.specialSel
        const str = list.join(",");
        let value = this.form[column.prop];

        // 级联联动回参为最后索引值
        const type = column.type
        if(type === 'cascader' && typeof(value) === 'object') {
          value = value[value.length-1]
        }
        // 下一个节点
        // const columnNext = item[index + 1] || {}; //获取下一个联动节点属性
        // const columnNextProp = columnNext.prop;
        
      
        // lsc: 无序联动关系表单
        let columnNext = {};
        let columnNextProp = '';
        item.forEach((ele) => {
          if (ele.prop === list[0]) {
            columnNext = ele;
            columnNextProp = columnNext.prop;
          }
          if(ele.cascaderItem && ele.specialSel && column.prop === ele.prop) {
            this.getProp = []
            let cadval = ''

            ele.cascaderItem.forEach((cad, i) => {
              if(i===0) {
                this.getProp.push(this.form[ele.prop])
                cadval = cad
              }else {
                this.getProp.push(this.form[cadval])
                cadval = cad
              }
            })
          }

          if(column.prop === ele.parentProp && ele.specialSel) {

            this.getProp = []
            ele.allProp.forEach((ap) => {
                this.getProp.push(this.form[ap])
            })
          }

        });

        /**
         * 1.判断当前节点是否有下级节点
         * 2.判断当前节点是否有值
         */
        if (
          this.validatenull(list) ||
          this.validatenull(value) ||
          this.validatenull(columnNext)
        ) {
          return;
        }

        // 如果不是首次加载则清空全部关联节点的属性值和字典值
        if (this.formList.includes(str)) {
          //清空子类字典列表和值
          list.forEach(ele => {
            this.form[ele] = "";
            this.$set(this.DIC, ele, []);
          });
        }
        // 根据当前节点值获取下一个节点的字典
        let url_dic = ''
        if(specialSel) {
          url_dic = columnNext.dicUrl.replace("{{key}}", this.getProp[0]).replace("{{key1}}", this.getProp[1]).replace("{{key2}}", this.getProp[2]).replace("{{key3}}", this.getProp[3]).replace("{{key4}}", this.getProp[4])
        }else {
          // zjp： 20191215 前端控制台经常报replace错误，发现原因有时没有dicUrl为undefined 需要判断处理下
          if (columnNext.dicUrl) {
            url_dic = columnNext.dicUrl.replace("{{key}}",value).replace("{{key1}}", '').replace("{{key2}}", '').replace("{{key3}}", '').replace("{{key4}}", '')
          }
        }
        setTimeout(() => {
          
        sendDic({ url: url_dic }).then(
          res => {
            const dic = Array.isArray(res) ? res : [];
            // 修改字典
            this.$set(this.DIC, columnNextProp, dic);
            /**
             * 1.是change多级默认联动
             * 2.字典不为空
             * 3.非首次加载
             */
            if (!this.validatenull(dic) && this.formList.includes(str)) {
              //取字典的指定项或则第一项
              let dicvalue = dic[columnNext.defaultIndex || 0];
              if (!dicvalue) dicvalue = dic[0];
              if (dicvalue) {
                this.form[columnNext.prop] =
                  dicvalue[
                  (columnNext.props || this.parentOption.props || {}).value ||
                  "value"
                  ];
                this.clearValidate();
              }
            }
            //首次加载的放入队列记录
            if (!this.formList.includes(str)) this.formList.push(str);
          }
        );
        }, 500);
        
      }, 0)
    },
    handleChangeMore(item, index) {
      //级联校验
      const column = item[index]; 
      const type = column.type
      if(type === 'cascader' || type === 'ntree') {
        console.log(type)
        this.validateField(column.prop)
      }
    },
    formVal () {
      // Object.keys(this.value).forEach(ele => {
      //   this.$set(this.form, ele, this.value[ele]);
      // });
      // 周美婷：解决日期默认为1988-11-31
      let _this = this
      Object.keys(_this.value).forEach(function (ele) {
        var columnList = _this.findColumnIndex(ele, true);
        var groupIndex = columnList[0]; //分组序号
        var columnIndex = columnList[1]; //列序号
        var val = _this.value[ele];
        if(_this.columnOption[groupIndex]){
          var column =_this.columnOption[groupIndex].column[columnIndex];
          if(column && column.type==='date' && val==='0000-00-00'){//解决日期默认为1988-11-31
            val='';
          }
        }
        _this.$set(_this.form, ele, val);
      });
      this.forEachLabel();
      this.$emit("input", this.form);
    },
    handleMock () {
      if (this.isMock) {
        this.columnOption.forEach(column => {
          const form = mock(column.column, this.DIC, this.form, this.isMock);
          if (!this.validatenull(form)) {
            Object.keys(form).forEach(ele => {
              this.form[ele] = form[ele];
            });
            this.clearValidate();
          }
        });
        this.$message.success("模拟数据填充成功");
      }
    },
    // 验证表单是否禁止
    vaildDisabled (column) {
      if (this.disabled) return true;
      if (!this.validatenull(column.disabled)) {
        return this.vaildData(column.disabled, false);
      } else if (this.boxType === "add") {
        return this.vaildData(column.addDisabled, false);
      } else if (this.boxType === "edit") {
        return this.vaildData(column.editDisabled, false);
      } else if (this.boxType === "view") {
        return true;
      } else {
        return false;
      }
    },
    // 验证表单是否显隐
    vaildDisplay (column) {
      if (!this.validatenull(column.display)) {
        return this.vaildData(column.display, true);
      } else if (this.boxType === "add") {
        return this.vaildData(column.addDisplay, true);
      } else if (this.boxType === "edit") {
        return this.vaildData(column.editDisplay, true);
      } else if (this.boxType === "view") {
        return this.vaildData(column.viewDisplay, true);
      } else {
        return true;
      }
    },
    rulesInit (option) {
      (option || this.columnOption).forEach(ele => {
        if (ele.rules && ele.display !== false)
          this.$set(this.formRules, ele.prop, ele.rules);
      });
      this.$nextTick(() => {
        this.clearValidate();
      });
    },
    clearValidate () {
      this.$refs.form.clearValidate();
    },
    validate () {
      return new Promise((resolve, reject) => {
        this.$refs.form.validate(valid => {
          if (valid) {
            resolve();
          } else {
            reject();
          }
        });
      });
    },
    /**
     * 清空表单字段
     * @param part:true 清空在column中字段,否则清空全部
     */
    resetForm (params = {}) {
      const part = params.part;
      if (part) {
        this.columnOption.forEach(ele => {
          ele.column.forEach(column => {
            const prop = column.prop;
            this.form[prop] = this.formDefault.tableForm[prop];
          });
        });
      } else {
        this.form = this.deepClone(this.formDefault.tableForm);
      }
      console.log(this.form)
      this.$emit("input", this.form);
      this.$emit("reset-change");
      this.clearValidate();
    },
    validate (callback) {
      this.$refs["form"].validate(valid => callback(valid));
    },
    show () {
      this.allDisabled = true;
    },
    hide () {
      this.allDisabled = false;
    },
    submit () {
      this.validate(valid => {
        if (valid) {
          this.show();
          this.$emit("submit", this.form, this.hide);
        }else {
          this.$message.warning("必填项不能为空");
        }
      });
    }
  }
});
</script>