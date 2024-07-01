import {
  CheckArrayType,
  SelectionType,
  InputDataType,
  OutputDataType,
} from "@/types";
import { i18n } from "i18next";

export const compareText = function (a: string, b: string) {
  const textA = a.toUpperCase();
  const textB = b.toUpperCase();
  return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
};

export const transferColorProperty = (
  checkArray: Array<CheckArrayType>,
  selections: Array<SelectionType>,
) => {
  return checkArray.map((checkObj: CheckArrayType) => {
    const matchingObj = selections.find(
      (selectedObj: SelectionType) => selectedObj.label === checkObj.label,
    );
    if (matchingObj) {
      return { ...checkObj, backgroundColor: matchingObj.color };
    }
    return checkObj;
  });
};

export const transformData = (inputData: Array<InputDataType>) => {
  const output: OutputDataType = {};

  inputData.forEach((obj: InputDataType, index: number) => {
    if (obj !== null) {
      for (const key in obj) {
        // eslint-disable-next-line no-prototype-builtins
        if (obj.hasOwnProperty(key)) {
          if (!output[key]) {
            output[key] = {
              label: key,
              data: new Array(inputData.length).fill(0),
            };
          }
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          output[key].data[index] = obj[key];
        }
      }
    }
  });

  return Object.values(output);
};

export const checkLang = (i18n: i18n) => {
  const storedLang = localStorage.getItem("selectedLang");
  if (typeof storedLang == "string" && storedLang !== i18n.language) {
    i18n.changeLanguage(storedLang);
  }
};
