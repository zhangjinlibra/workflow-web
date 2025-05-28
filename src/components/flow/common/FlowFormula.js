import { WIDGET } from "@/components/flow/common/FlowConstant";
import ObjectUtil from "@/components/flow/common/ObjectUtil";

/**
 * 校验表单组件的公式
 *
 * @param {Array} widgets
 * @returns 公式有错误的组件名称列表
 */
export const formulaWidgetVerify = (widgets) => {
  let formulaErrorWidgetNameList = [];
  if (!(widgets && widgets.length)) return formulaErrorWidgetNameList;

  widgets.forEach((widget) => {
    let { name, type, details, formulaItems } = widget;
    if (type == WIDGET.DETAIL) {
      // 筛选出可以作为公式的明细组件
      let formulaDetailWidgetKv = {};
      let formulaDetailWidgets = (details || []).filter((i) => {
        let { required, type, label, name } = i;
        if (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
          formulaDetailWidgetKv[name] = label;
        }
        return type == WIDGET.FORMULA;
      });

      // 校验明细组件的单项公式
      (formulaItems || []).forEach((i) => {
        let { value } = i;
        if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
        if (formulaDetailWidgetKv.hasOwnProperty(value)) {
          i.name = formulaDetailWidgetKv[value]; // 更新被引用组件的名称
        } else {
          formulaErrorWidgetNameList.push(name);
        }
      });

      (formulaDetailWidgets || []).forEach((formulaDetailWidget) => {
        let { formulaItems, name: formulaDetailName } = formulaDetailWidget;
        (formulaItems || []).forEach((i) => {
          let { value } = i;
          if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
          if (formulaDetailWidgetKv.hasOwnProperty(value)) {
            i.name = formulaDetailWidgetKv[value]; // 更新被引用组件的名称
          } else {
            formulaErrorWidgetNameList.push(formulaDetailName);
          }
        });
      });
    } else if (type == WIDGET.FORMULA && formulaItems && formulaItems.length) {
      // 筛选出可以作为公式的组件
      let formulaWidgetKv = {};
      widgets.forEach((widget) => {
        let { required, type, label, name } = widget;
        if ((required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) || type == WIDGET.DETAIL) {
          formulaWidgetKv[name] = label;
        }
      });

      formulaItems.forEach((i) => {
        let { value } = i;
        if (value.length <= 1) return; // 符号的长度为1，剔除掉，这里只校验组件的引用
        if (formulaWidgetKv.hasOwnProperty(value)) {
          i.name = formulaWidgetKv[value]; // 更新被引用组件的名称
        } else {
          formulaErrorWidgetNameList.push(name);
        }
      });
    }
  });
  return formulaErrorWidgetNameList;
};

/**
 * 初始化公式组件公式
 *
 * @param {Array} widgets
 */
export const initWidgetFormula = (widgets) => {
  (widgets || []).forEach((widget) => {
    let { type, formulaItems, details } = widget;
    if ([WIDGET.DETAIL, WIDGET.FORMULA].includes(type) && !!formulaItems && formulaItems.length) {
      widget.formula = "${" + formulaItems.map((i) => i.value).join("") + "}";
      if (type == WIDGET.FORMULA) {
        widget.placeholder = formulaItems.map((i) => i.name).join("");
      }
    }

    if (type == WIDGET.DETAIL && !!details && details.length) {
      initWidgetFormula(details);
    }
  });
};

/**
 * 解析公式表达式中的组件名称
 *
 * @param {String} formula
 */
export const listFormulaWidgetNames = (formula) => {
  if (!ObjectUtil.isNotEmpty(formula)) return [];
  const regex = /[A-Z]+_\d{18}/g;
  const matches = formula.match(regex);
  return matches || [];
};

/**
 *计算公式结果
 *
 * @param {String} formula
 * @param {Object} vars
 * @returns
 */
export const formulaEval = (formula, vars) => {
  if (!ObjectUtil.isNotEmpty(formula)) return 0;
  let exp = formula.replace("${", "").replace("}", "");
  let widgets = listFormulaWidgetNames(exp);
  widgets.forEach((name) => {
    let value = vars[name] || "0";
    exp = exp.replace(name, value);
  });
  let result = 0;
  try {
    result = eval(exp);
  } catch (error) {}
  // 最高4为精度
  return Math.round(result * Math.pow(10, 4)) / Math.pow(10, 4);
};

/**
 * 表单明细汇总计算
 *
 * @param {Array} detailValues
 * @param {String} formula
 */
export const formFormulaDetailCalc = (detailValues, formula) => {
  let detailWidgetNames = listFormulaWidgetNames(formula);
  if (!(detailWidgetNames && detailWidgetNames.length && detailValues && detailValues.length)) return "";
  let amount = 0;
  for (let detailValue of detailValues) {
    let formDetailVarContext = {};
    detailWidgetNames.forEach((detailWidgetName) => {
      formDetailVarContext[detailWidgetName] = detailValue[detailWidgetName] || 0;
    });
    amount += formulaEval(formula, formDetailVarContext) || 0;
  }
  return amount;
};

/**
 * 表单公式自动计算
 *
 * @param {Object} formValue
 * @param {Array} widgets
 */
export const formFormulaAutoCalc = (formValue, widgets) => {
  let formVarContext = {};
  widgets
    .filter((widget) => {
      let { name, type, formula, required, details: detailWidgets } = widget;
      if (required && [WIDGET.NUMBER, WIDGET.MONEY].includes(type)) {
        formVarContext[name] = formValue[name] || 0;
      } else if (type == WIDGET.DETAIL && detailWidgets && detailWidgets.length) {
        let detailValues = formValue[name] || [];
        for (let i = 0; i < detailValues.length; i++) {
          let formDetailVarContext = {};
          let detailValue = detailValues[i];
          detailWidgets
            .filter((detailWidget) => {
              let { name: detailName, type: detailType, formula: detailFormula, required: detailRequired } = detailWidget;
              if (detailRequired && [WIDGET.NUMBER, WIDGET.MONEY].includes(detailType)) {
                formDetailVarContext[detailName] = detailValue[detailName] || 0;
              }
              return detailType == WIDGET.FORMULA && detailFormula;
            })
            .forEach((detailWidget) => {
              // 处理公式
              let { name: detailName, formula: detailFormula } = detailWidget;
              let formualValue = formulaEval(detailFormula, formDetailVarContext) || 0;
              formDetailVarContext[detailName] = formualValue;
              detailValue[detailName] = formualValue;
            });

          let value = formVarContext[name] || 0;
          value += formulaEval(formula, formDetailVarContext) || 0;
          formVarContext[name] = value;
        }
      }
      return type == WIDGET.FORMULA && formula;
    })
    .forEach((widget) => {
      // 处理公式
      let { name, formula } = widget;
      let value = formulaEval(formula, formVarContext) || 0;
      formValue[name] = value;
    });
};
