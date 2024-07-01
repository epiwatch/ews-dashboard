import React, { useEffect, useState } from 'react';
import { DataGrid, GridColDef, GridPaginationModel } from '@mui/x-data-grid';
import { Box } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Button, IconButton } from '@mui/material';
import FeedIcon from '@mui/icons-material/Feed';
import EditIcon from '@mui/icons-material/Edit';
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import ArticleEditor from './ArticleEditor';
import exampleArticleData from './jsons/exampleArticleData.json';

const VarCircle = (value: boolean) => {
    return <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
        {value ? (
            <CircleIcon style={{ color: 'green' }} />
        ) : (
            <CircleIcon style={{ color: 'red' }} />
        )}
    </Box>;
};


const PrioCircle = (value: number) => {
    let colour = "green";
    let text = "Low";
    if (value < 0.5) {
        colour = "green";
        text = "Low";
    } else if (value < 0.9) {
        colour = "orange";
        text = "Medium";
    } else if (value < 0.99) {
        colour = "red";
        text = "High";
    } else {
        colour = "darkred";
        text = "VHigh";
    }
    return <Box display="flex" alignItems="center" width="100%" height="100%">
        <CircleIcon style={{ color: colour }}></CircleIcon>
        {text}
    </Box>;
};

const headCells = [
    {
        field: 'id',
        headerName: 'Report ID',
        flex: 1,
        editable: false,
        sortable: false,
        filter: false,
        hideable: false
    },
    {
        field: 'disease',
        headerName: 'Disease',
        flex: 1,
        editable: false,
        sortable: false,
        filter: false,
        hideable: false
    },
    {
        field: 'syndrome',
        headerName: 'Syndrome',
        flex: 1,
        editable: false,
        sortable: false,
        filter: false,
        hideable: false
    },
];



interface Article {
    id: number;
    hashed_value: string,
    reviewed: boolean;
    flagged: boolean;
    audited: boolean;
    suggested_priority_score: number;
    priority: number;
    execution_timestamp: string;
    name: string;
    no_reports: number;
}

interface ReportInfo {
    report_id: number;
    epiwatch_user_id: number;
    entry_timestamp: string;
}

const ArticleReports = () => {
    const [value, setValue] = React.useState('1');
    const [article, setArticle] = React.useState(1524440);
    const [date, setDate] = React.useState("");
    const [process, setProcess] = React.useState("");
    const [priority, setPriority] = React.useState(0);
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return <TabContext value={value}>
        <Box sx={{
            borderBottom: 1,
            borderColor: "divider"
        }}>
            <TabList
                onChange={handleChange}
                aria-label="lab API tabs example"
            >
                <Tab label="Article Table" value="1" />
                <Tab label="Reviewer" value="2" />
                <Tab label="Review History" value="3" />
            </TabList>
        </Box>
        <TabPanel value="1"><Articles changeArticle={setArticle} changeValue={setValue} changeDate={setDate} changeProcess={setProcess} changePriority={setPriority} /></TabPanel>
        <TabPanel value="2"><ArticleEditor article_id={article} process_col={process} date={date} priority={priority} /></TabPanel>
        <TabPanel value="3"></TabPanel>
    </TabContext>;
};

const Articles = ({ changeArticle, changeValue, changeProcess, changeDate, changePriority }: any) => {

    const columns: readonly GridColDef[] = [
        {
            field: 'id',
            headerName: "ID",
            editable: false,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'priority_score',
            headerName: "Priority",
            renderCell: (params) => PrioCircle(params.value),
            editable: false,
            headerAlign: 'center',

        },
        {
            field: 'no_reports',
            headerName: "# Reports",
            editable: false,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: 'reviewed',
            headerName: "Reviewed",
            renderCell: (params) => VarCircle(params.value),
            editable: false,
            headerAlign: 'center',
            align: 'center',
            width: 140

        },
        {
            field: 'flagged',
            headerName: "Flagged",
            renderCell: (params) => VarCircle(params.value),
            editable: false,
            headerAlign: 'center',
            align: 'center',
            width: 140

        },
        {
            field: 'audited',
            headerName: "Verified",
            renderCell: (params) => VarCircle(params.value),
            editable: false,
            headerAlign: 'center',
            align: 'center',
            width: 140

        },
        {
            field: 'suggested_priority_score',
            headerName: "Suggested Priority",
            renderCell: (params) => VarCircle(params.value),
            editable: false,
            headerAlign: 'center',
            align: 'center',
            width: 140
        },
        {
            field: 'name',
            headerName: "Collection",
            editable: false,
            width: 250
        },
        {
            field: 'execution_timestamp',
            headerName: "Timestamp",
            editable: false,
            width: 200
        },
        {
            field: 'Actions',
            headerName: "Actions",
            editable: false,
            headerAlign: 'center',
            align: 'center',
            renderCell: (params) => <><IconButton onClick={() => handleClickOpen(params.row)}><FeedIcon /></IconButton><IconButton onClick={() => {
                changeValue("2");
                changeArticle(params.row.id);
                changeProcess(params.row.name);
                changeDate(params.row.execution_timestamp);
                changePriority(params.row.priority_score);
            }}><EditIcon /></IconButton></>,
        },
    ];
    const [open, setOpen] = useState(false);
    const [selectedRow, setSelectedRow] = useState<Article | null>(null);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reports, setReports] = useState([]);
    const [latestReport, setLatestReport] = useState<ReportInfo | null>();
    const [reportLoading, setReportLoading] = useState(false);
    const [paginationModel, setPaginationModel] = useState({
        page: 0,
        pageSize: 14,
    });
    const [rowCount, setRowCount] = useState(0);

    const getArticles = async (val: GridPaginationModel) => {
        console.log(val);
        setLoading(true);
        const data = exampleArticleData.getArticleUrlsStats;
        setRows(data);
        setRowCount(data.length);
        setLoading(false);
    };

    const getNoRows = async () => {
        setRowCount(1234);
    };

    const getReports = async (id: number) => {
        const data = exampleArticleData.getArticleReports;
        setReports(data);
    };

    const handleClickOpen = (row: Article) => {
        setSelectedRow(row);
        getReports(row.id);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
        setLatestReport(null);
        setReports([]);
        setSelectedRow(null);
    };


    useEffect(() => {
        getArticles(paginationModel);
        getNoRows();
    }, []);



    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '90vh',
            }}

        >
            <DataGrid
                columns={columns}
                rows={rows}
                initialState={{
                    pagination: { paginationModel: { pageSize: 14 } },
                }}
                loading={loading}
                paginationMode="server"
                pageSizeOptions={[14]}
                pagination
                rowCount={rowCount}
                onPaginationModelChange={async (val) => getArticles(val)}
            />

            <Dialog
                open={open}
                onClose={handleClose}
                fullWidth={true}
                maxWidth="lg"
            >
                <DialogTitle>{"Report Information"}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        {selectedRow ? (
                            <Box>
                                <strong>Article ID:</strong> {selectedRow.id} <br />
                                <strong>URL:</strong> {selectedRow.hashed_value} <br />

                                <DialogTitle>{"Reports"}</DialogTitle>
                                <DataGrid
                                    loading={reportLoading}
                                    columns={headCells}
                                    rows={reports}
                                />
                            </Box>
                        ) : null}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>


    );
};

export default ArticleReports;