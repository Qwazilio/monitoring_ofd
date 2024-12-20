'use client'
import classes from "@/components/terminalImport.module.scss"
import { Dispatch, SetStateAction } from "react";
import * as XLSX from "xlsx";

interface TerminalImportXLSXProps{
    setTerminals: Dispatch<SetStateAction<(TerminalEntity | CardEntity)[][]>>
    visible: Dispatch<SetStateAction<boolean>>
    sendOnServer: () => void
}
export default function TerminalImportXLSX({setTerminals} : TerminalImportXLSXProps) {


    const convertExcelDateToJSDate = (excelDate) => {
        const date = new Date((excelDate - 25569) * 86400 * 1000);
        return date;
    };
      
    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        setTerminals([])
        const file = event.target.files[0];
        const reader = new FileReader();
    
        reader.onload = (event : ProgressEvent<FileReader>) => {
          const data = new Uint8Array(event.target.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
    
          const terminalData = json.map((row) => ([{
            organization: row["Наименование магазина"] as string,
            name_terminal: row["Наименование кассы"] as string,
            uid_terminal: row["ЗН"] as string,
            reg_number: row["РНМ"] as string,
            comment: row["Дополнительный идентификатор"] as string,
            address: row["Адрес кассы"] as string,
            end_date_sub: convertExcelDateToJSDate(row["Дата окончания подписки"]) as Date,
          } as TerminalEntity,
          {
            end_date_card: convertExcelDateToJSDate(
              row["Прогнозируемая дата окончания ФН"] as Date
            ),
            uid_card: row["ФН"] as string,
            uid_terminal: row["ЗН"] as string,
          } as CardEntity
        ] ));
    
          setTerminals(terminalData)
        };
    
        reader.readAsArrayBuffer(file);
    };

    return(
        <div className={classes.wrapper}>
        <h3 style={{textAlign: "center", fontSize: "1.2em"}}>Импорт из файла</h3>
        <input
          onChange={(event) => handleFileUpload(event)}
          type="file"
          accept=".xlsx, .xls"
        />      
      </div>
    )
}