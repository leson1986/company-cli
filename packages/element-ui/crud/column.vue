<template>
  <span>
    <template v-for="(column,index) in list">
      <dynamic-column v-if="column.children && column.children.length"
                      :columnOption="column"
                      :key="column.label">
        <template v-for="(item,index) in crud.propOption"
                  slot-scope="scope"
                  :slot="item.prop">
          <slot :row="scope.row"
                :dic="scope.dic"
                :size="scope.size"
                :label="scope.label"
                :name="item.prop"></slot>
        </template>
      </dynamic-column>
      <template v-else-if="!['dynamic'].includes(column.type)">
        <el-table-column v-if="vaildColumn(column.prop)"
                         :key="column.prop"
                         :prop="column.prop"
                         :label="column.label"
                         filter-placement="bottom-end"
                         :filters="handleFilters(column)"
                         :filter-method="column.filter? handleFiltersMethod : undefined"
                         :filter-multiple="vaildData(column.filterMultiple,true)"
                         :show-overflow-tooltip="column.overHidden"
                         :min-width="column.minWidth"
                         :sortable="column.sortable"
                         :render-header="column.renderHeader"
                         :align="column.align || crud.tableOption.align"
                         :header-align="column.headerAlign || crud.tableOption.headerAlign"
                         :width="column.width"
                         :fixed="crud.isMobile?false:column.fixed">
          <template slot-scope="scope">
            <span>
              <form-temp :column="column"
                         v-if="cellEditFlag(scope.row,column)"
                         size="mini"
                         :dic="(crud.cascaderDIC[scope.row.$index] || {})[column.prop] || crud.DIC[column.prop]"
                         :t="t"
                         :props="column.props || crud.tableOption.props"
                         :disabled="column.disabled || crud.btnDisabled"
                         :clearable="vaildData(column.clearable,false)"
                         :upload-before="crud.uploadBefore"
                         :upload-after="crud.uploadAfter"
                         v-model="scope.row[column.prop]"
                         @change="column.cascader?handleChange(index,scope.row):''">
              </form-temp>
              <slot :row="scope.row"
                    :dic="crud.DIC[column.prop]"
                    :size="crud.isMediumSize"
                    :label="handleShowLabel(scope.row,column,crud.DIC[column.prop])"
                    :name="column.prop"
                    v-else-if="column.slot"></slot>
              <template v-else>
                <span v-if="column.parentProp">{{handleDetail(scope.row,column,(crud.cascaderDIC[scope.row.$index] || {})[column.prop])}}</span>

                <template v-else-if="['upload'].includes(column.type)">
                  <avue-img :align="column.align"
                            :listType="column.listType"
                            :imgWidth="column.imgWidth"
                            :fullscreen="column.imgFullscreen"
                            :imgHeight="column.imgHeight"
                            :imgType="column.imgType"
                            :type="menuText()"
                            :dataType="column.dataType"
                            :size="crud.isMediumSize"
                            :value="scope.row[column.prop]"
                            v-if="scope.row[column.prop]"></avue-img>
                </template>
                <span v-else-if="['color'].includes(column.type)">
                  <i class="avue-crud__color"
                     :style="{backgroundColor:scope.row[column.prop]}"></i>
                </span>
                <span v-else-if="['icon-select'].includes(column.type)">
                  <i class="avue-crud__icon-select"
                     :class="scope.row[column.prop]"></i>
                </span>
                <span v-else-if="column.displayAs=='switch' && ['switch'].includes(column.type)">
                  <el-switch v-model="scope.row[column.prop]"
                             disabled />
                </span>
                <span v-else
                      v-html="handleDetail(scope.row,column,crud.DIC[column.prop])"></span>
              </template>
            </span>

          </template>

        </el-table-column>
      </template>
    </template>

  </span>

</template>

<script>
import dynamicColumn from "./dynamic-column";
import locale from "../../core/common/locale";
import { sendDic } from "core/dic";
import { getComponent, getPlaceholder } from "core/dataformat";
import formTemp from '../../core/components/form/index'
import { detail } from "core/detail";
export default {
  name: "column",
  mixins: [locale],
  components: {
    formTemp,
    dynamicColumn
  },
  inject: ["crud"],
  provide () {
    return {
      crud: this.crud,
      dynamic: this
    };
  },
  props: {
    columnOption: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  computed: {
    list () {
      let result = [...this.columnOption];
      return result;
    }
  },
  methods: {
    getComponent,
    getPlaceholder,
    vaildColumn (prop) {
      return ((this.crud.$refs.dialogColumn || {}).columnIndex || []).includes(
        prop
      );
    },
    menuText (value) {
      return this.menuType === "text" ? "text" : value;
    },
    handleDetail (row, column, DIC) {
      let result = row[column.prop];
      result = detail(row, column, this.crud.tableOption, DIC);
      if (!this.validatenull(DIC)) {
        row["$" + column.prop] = result;
      }
      return result;
    },
    handleShowLabel (row, column, DIC) {
      let result = "";
      if (!this.validatenull(DIC)) {
        result = detail(row, column, this.tableOption, DIC);
        row["$" + column.prop] = result;
      }
      return result;
    },
    handleChange (index, row) {
      const columnOption = [...this.crud.propOption];
      //本节点;
      const column = columnOption[index];
      const list = column.cascader;
      let value = row[column.prop];
      const rowIndex = row.$index;
      const str = list.join(",");
      const specialSel = column.specialSel

      // 级联联动回参为最后索引值
      const type = column.type
      if(type === 'cascader' && typeof(value) === 'object') {
        value = value[value.length-1]
      }
      // console.log(str)
      // console.log(this.crud.formCellList)
      // console.log('--------------------')
      // console.log(list)
      // console.log(value)
      // console.log(columnNext)
      // console.log('--------------------')
      // 下一个节点
      // const columnNext = columnOption[index + 1];
      // const columnNextProp = columnNext.prop;

      // lsc: 无序联动关系表单
      let columnNext = {};
      let columnNextProp = '';
      columnOption.forEach((ele) => {
        if (ele.prop === list[0]) {
          columnNext = ele;
          columnNextProp = columnNext.prop;
        }
        if(ele.cascaderItem && ele.specialSel && column.prop === ele.prop) {
          this.getProp = []
          let cadval = ''

          ele.cascaderItem.forEach((cad, i) => {
            if(i===0) {
              this.getProp.push(row[ele.prop])
              cadval = cad
            }else {
              this.getProp.push(row[cadval])
              cadval = cad
            }
          })
        }

        if(column.prop === ele.parentProp && ele.specialSel) {

          this.getProp = []
          ele.allProp.forEach((ap) => {
              this.getProp.push(row[ap])
          })
        }

      });

      //最后一级
      if (
        this.validatenull(list) ||
        // this.validatenull(value) ||
        this.validatenull(columnNext)
      ) {
        return;
      }
        // console.log('继续跑')
        
      // 如果本节点没有字典则创建节点数组
      if (this.validatenull(this.crud.cascaderDIC[rowIndex])) {
        this.$set(this.crud.cascaderDIC, rowIndex, {});
      }
      // 如果存在队列中则清空字典和值
      if (this.crud.formCellList.includes(str)) {
      // if (this.crud.formIndexList.includes(rowIndex)) {
        // console.log('list')
        // console.log(list)
        // console.log('list-----end')
        //清空子类字典
        list.forEach(ele => {
          row[ele] = ""
          this.$set(this.crud.cascaderDIC[rowIndex], ele.prop, []);
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

        sendDic({ url: url_dic }).then(
        res => {
          // 修改字典
          const dic = Array.isArray(res) ? res : [];
          this.$set(this.crud.cascaderDIC[rowIndex], columnNextProp, dic);
          /**
           * 1.是change多级默认联动
           * 2.字典不为空
           * 3.非首次加载
           */
          if (
            !this.validatenull(dic)
            && this.crud.formIndexList.includes(rowIndex)
            // && this.crud.formCellList.includes(str)
          ) {
            //取字典的指定项或则第一项
            let dicvalue = dic[columnNext.defaultIndex || 0];
            if (!dicvalue) dicvalue = dic[0];
            if (dicvalue) {
              row[columnNext.prop] =
                dicvalue[
                (columnNext.props || this.crud.parentOption.props || {})
                  .value || "value"
                ];
            }
          }
            //首次加载的放入队列记录
            if (!this.crud.formCellList.includes(str)) this.crud.formCellList.push(str);
        }
      );
    },
    cellEditFlag (row, column) {
      return (
        row.$cellEdit &&
        column.slot !== true &&
        column.cell
      );
    },
    // 图标显示
    iconShow (prop, record) {
      return (
        prop === this.crud.treeProp &&
        record.children &&
        record.children.length > 0
      );
    },
    // 切换下级是否展开
    toggleExpanded (row, index) {
      row._expand = !row._expand;
      this.$set(this.crud.list, index, row);
    },
    //表格筛选逻辑
    handleFiltersMethod (value, row, column) {
      const columnNew = this.columnOption.filter(
        ele => ele.prop === column.property
      )[0];
      if (typeof columnNew.filtersMethod === "function") {
        return columnNew.filtersMethod(value, row, columnNew);
      } else {
        return row[columnNew.prop] === value;
      }
    },
    //表格筛选字典
    handleFilters (column) {
      if (column.filter !== true) return undefined;
      if (this.validatenull(column.dicFilters)) {
        let list = [];
        (this.crud.DIC[column.prop] || []).forEach(ele => {
          const props = column.props || this.crud.tableOption.props || {};
          list.push({
            text: ele[props.label || "label"],
            value: ele[props.value || "value"]
          });
        });
        return list;
      }
      return column.dicFilters;
    }
  }
};
</script>

