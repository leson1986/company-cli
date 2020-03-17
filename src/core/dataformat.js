import { validatenull } from 'utils/validate';
import { KEY_COMPONENT_NAME } from 'global/variable';
/**
 * 计算级联属性
 */
export const calcCascader = (list = []) => {
  // lsc: 无序联动关系表单
  let cascader = [];
  let parentProp = '';
  let allProp = '';
  list.forEach((ele, index) => {
    if (ele.cascaderItem) {
      cascader = [...ele.cascaderItem];
      parentProp = ele.prop;
      allProp = [ele.prop, ...ele.cascaderItem];
      list[index].cascader = [...cascader];
      // cascader.forEach((citem, cindex) => {
      //   const columnIndex = index + cindex + 1;
      //   list[columnIndex].parentProp = parentProp;
      //   list[columnIndex].cascaderChange = ele.cascaderChange;
      //   list[columnIndex].cascader = [...cascader].splice(cindex + 1);
      //   parentProp = list[columnIndex].prop;
      // });
      // lsc: 无序联动关系表单
      cascader.forEach((ele, cindex) => {
        list.forEach((item, index) => {
          if (ele === item.prop) {
            list[index].allProp = allProp;
            list[index].parentProp = parentProp;
            list[index].cascaderChange = ele.cascaderChange;
            list[index].cascader = [...cascader].splice(cindex + 1);
            parentProp = list[index].prop;
          }
        });
      });
    }
  });
  // console.log(list)
  return list;
};
/**
 * 计算空白列row
 */
let count = 0;
export const calcCount = (ele, spanDefault = 12, init = false) => {
  if (init) count = 0;
  const spanAll = 24;
  count = count + (ele.span || spanDefault) + (ele.offset || 0);
  if (count === spanAll) {
    count = 0;
  } else if (count > spanAll) {
    count = 0 + (ele.span || spanDefault) + (ele.offset || 0);
  } else if (ele.row && count !== spanAll) {
    ele.count = spanAll - count;
    count = 0;
  }
  return ele;
};
/**
* 日期控件集合
*/
export const dateList = [
  'dates',
  'date',
  'datetime',
  'datetimerange',
  'daterange',
  'week',
  'month',
  'monthrange',
  'dategrpup',
  'year'
];
/**
 * 初始化数据格式
 */
export const initVal = ({ listType, type, multiple, dataType, value }) => {
  if (
    (['select', 'tree', 'ntree'].includes(type) && multiple) ||
    ['checkbox', 'cascader', 'dynamic', 'upload'].includes(type)
  ) {
    // 头像框特殊处理
    if (listType === 'picture-img' && type === 'upload') {
      return [value];
    }
    if (Array.isArray(value)) return value;
    else if (!validatenull(value)) {
      const list = (value || '').split(',') || [];
      if (dataType === 'number') {
        return list.map(ele => Number(ele));
      } else {
        return list;
      }
    } else {
      return [];
    }
  }
  return value;
};

/**
 * 行编辑框获取动态组件
 */
export const getCellType = type => {
  let result = 'input';
  if (['select', 'radio', 'checkbox'].includes(type)) {
    result = 'select';
  } else if (['time', 'timerange'].includes(type)) {
    result = 'time';
  } else if (dateList.includes(type)) {
    result = 'date';
  } else if (['cascader'].includes(type)) {
    result = 'cascader';
  } else if (['ntree'].includes(type)) {
    result = 'ntree';
  } else if (['number'].includes(type)) {
    result = 'input-number';
  } else if (['switch'].includes(type)) {
    result = 'switch';
  }
  return KEY_COMPONENT_NAME + result;
};
/**
 * 搜索框获取动态组件
 */
export const getSearchType = type => {
  let result = 'input';
  if (['select', 'radio', 'checkbox', 'switch'].includes(type)) {
    result = 'select';
  } else if (['time', 'timerange'].includes(type)) {
    result = 'time';
  } else if (dateList.includes(type)) {
    result = 'date';
  } else if (['cascader'].includes(type)) {
    result = 'cascader';
  } else if (['ntree'].includes(type)) {
    result = 'ntree';
  } else if (['number'].includes(type)) {
    result = 'input-number';
  }
  return KEY_COMPONENT_NAME + result;
};

/**
 * 动态获取组件
 */
export const getComponent = (type, component) => {
  let result = 'input';
  if (!validatenull(component)) {
    result = component;
  } else if (type === 'select') {
    result = 'select';
  } else if (type === 'radio') {
    result = 'radio';
  } else if (type === 'checkbox') {
    result = 'checkbox';
  } else if (['time', 'timerange'].includes(type)) {
    result = 'time';
  } else if (dateList.includes(type)) {
    result = 'date';
  } else if (type === 'cascader') {
    result = 'cascader';
  } else if (type === 'ntree') {
    result = 'ntree';
  } else if (type === 'number') {
    result = 'input-number';
  } else if (type === 'password') {
    result = 'input';
  } else if (type === 'switch') {
    result = 'switch';
  } else if (type === 'rate') {
    result = 'rate';
  } else if (type === 'upload') {
    result = 'upload';
  } else if (type === 'slider') {
    result = 'slider';
  } else if (type === 'dynamic') {
    result = 'dynamic';
  } else if (type === 'icon-select') {
    result = 'icon-select';
  } else if (type === 'color') {
    result = 'color';
  }
  return KEY_COMPONENT_NAME + result;
};

/**
 * 表格初始化值
 */

export const formInitVal = (list = []) => {
  let tableForm = {};
  let searchForm = {};
  list.forEach(ele => {
    if (
      ele.type === 'checkbox' ||
      ele.type === 'cascader' ||
      ele.type === 'ntree' ||
      ele.type === 'dynamic' ||
      ele.type === 'dates' ||
      (ele.type === 'upload' && ele.listType !== 'picture-img') ||
      ele.multiple ||
      ele.range ||
      ele.dataType === 'array'
    ) {
      tableForm[ele.prop] = [];
      if (ele.search) searchForm[ele.prop] = [];
    } else if (
      ['number', 'rate', 'slider'].includes(ele.type) ||
      ele.dataType === 'number'
    ) {
      tableForm[ele.prop] = undefined;
      if (ele.search) {
        searchForm[ele.prop] = undefined;
      }
    } else {
      tableForm[ele.prop] = '';
      if (ele.search) {
        searchForm[ele.prop] = '';
      }
    }
    if (
      ele.type === 'ntree' &&
      !ele.multiple
    ) {
      tableForm[ele.prop] = null;
    }
    // 表单默认值设置
    if (!validatenull(ele.valueDefault)) tableForm[ele.prop] = ele.valueDefault;
    // 搜索表单默认值设置
    if (!validatenull(ele.searchDefault)) {
      searchForm[ele.prop] = ele.searchDefault;
    }
  });
  return {
    tableForm,
    searchForm
  };
};

export const getPlaceholder = function(column, type) {
  // 去除提示语
  if (!column.placeholder) {
    return '';
  }
  const placeholder = column.placeholder;
  const label = column.label;
  if (type === 'search') {
    const searchPlaceholder = column.searchPlaceholder;
    if (!validatenull(searchPlaceholder)) {
      return searchPlaceholder;
    } else {
      return label;
    }
  } else if (validatenull(placeholder)) {
    if (['select', 'checkbox', 'radio', 'tree'].includes(column.type)) {
      return `${this.t('tip.select')} ${label}`;
    } else {
      return `${this.t('tip.input')} ${label}`;
    }
  }

  return placeholder;
};

export const getType = column => {
  const type = column.type;
  const more = column.more || false;
  if (more) {
    if (type === 'date') {
      return 'daterange';
    } else if (type === 'datetime') {
      return 'datetimerange';
    } else if (type === 'time') {
      return 'timerange';
    } else {
      return type;
    }
  }
  if (type === 'textarea') {
    return 'input';
  }
  return type;
};
