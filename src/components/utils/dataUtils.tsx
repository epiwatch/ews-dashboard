import { CheckArrayType, SelectionType, InputDataType } from "@/types";

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
  const output: any = {};

  inputData.forEach((obj: InputDataType, index: number) => {
    if (obj) {
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          // key does not appear in output
          // give a default value of 0
          if (!output[key]) {
            output[key] = {
              label: key,
              data: new Array(inputData.length).fill(0),
            };
          }
          // key appear in output
          // pair the corresponding value to it
          output[key].data[index] = obj[key];
        }
      }
    }
  });

  return Object.values(output);
};
