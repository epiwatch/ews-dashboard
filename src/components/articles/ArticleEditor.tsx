import Grid from "@mui/material/Unstable_Grid2";
import Card from "@mui/material/Card";
import LinearProgress from "@mui/material/LinearProgress";
import { Box, CardContent, Checkbox, Chip, FormControlLabel, FormGroup, IconButton, Tab, Tabs, Typography } from "@mui/material";
import PublicSharpIcon from '@mui/icons-material/PublicSharp';
import { SyntheticEvent, useState, useEffect } from "react";
import Link from "next/link";
import ReportGUI from "./ReportGUI";
import exampleArticleData from './jsons/exampleArticleData.json';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface PrioChipProps {
  value: number;
}

const PrioChip: React.FC<PrioChipProps> = ({ value }) => {
  let colour = "green";
  let text = "Low";
  if (value < 0.5) {
    colour = "green";
    text = "Low";
  } else if (value < 0.9) {
    colour = "orange";
    text = "Medium";
  } else if (value < 0.99) {
    colour = "orange";
    text = "High";
  } else {
    colour = "darkred";
    text = "VHigh";
  }
  return <Chip size='small' style={{ background: colour, color: "white" }} label={text} />;
};

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ padding: '5px' }}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}


interface ArticleProps {
  article_id: number;
  process_col: string;
  date: string;
  priority: number;
}

const highlightText = (text: string) => {
  const test = {
    "article_reviewdata_field_id": 2,
    "value": "Curitiba registers 15 cases of Hepatitis A in one week; Most are young people between 20 and 39 years old",
    "value_original_language": "Curitiba registra 15 casos de Hepatite A em uma semana; maioria é de jovens entre 20 e 39 anos",
    "value_with_nlp": "(#[#[x:2]#]#) registers 15 cases of (#[#[x:1]#]#) in one week; Most are young people between 20 and 39 years old",
    "nlp_list": [
      {
        "nlp_index": 1,
        "display_text": "Hepatitis A",
        "category": "disease"
      },
      {
        "nlp_index": 2,
        "display_text": "Curitiba",
        "category": "location"
      }
    ]

  };
  let val_to_show = "";
  let do_nlp_replacement = false;
  if (test.value_with_nlp != null) {
    do_nlp_replacement = true;
    val_to_show = test.value_with_nlp;
  } else {
    val_to_show = test.value;
  }

  const date_style = "background-color: rgba(218, 243, 230, 0.5); border: 2px solid rgb(62, 185, 123);";
  const disease_style = "border: 2px solid rgb(216, 106, 106); background-color: rgba(241, 221, 221, 0.5);";
  const syndrome_style = "border: 2px solid rgb(223, 217, 101); background-color: rgba(238, 237, 213, 0.5);";
  const location_style = "border: 2px solid rgb(81, 138, 189); background-color: rgba(223, 235, 245, 0.5);";



  val_to_show = test.value_with_nlp;
  for (let i = 0; i < test.nlp_list.length; i++) {
    const this_nlp = test.nlp_list[i];
    let this_style = "";

    if (this_nlp.category === "location") {
      this_style = location_style;
    } else if (this_nlp.category === "date") {
      this_style = date_style;
    } else if (this_nlp.category === "disease") {
      this_style = disease_style;
    } else if (this_nlp.category === "syndrome") {
      this_style = syndrome_style;
    }
    const regex = new RegExp('\\(#\\[#\\[x:' + String(this_nlp.nlp_index) + '\\]#\\]#\\)', 'ig');
    const this_class = "nlp_item nlp_item_" + this_nlp.category;
    const nlp_tag_label = this_nlp.category.substring(0, 3).toUpperCase();
    const replacement = '<span style="' + this_style + '" @click="emit_nlp(' + this_nlp.nlp_index + ')">' + this_nlp.display_text + '<span style="font-weight: bold">&nbsp;[' + nlp_tag_label + ']&nbsp;</span></span>';
    val_to_show = val_to_show.replace(regex, replacement);
  }
  const renderedContent = <div dangerouslySetInnerHTML={{ __html: val_to_show }} />;
  return (
    <span>
      {renderedContent}
    </span>
  );
};

const ArticleEditor: React.FC<ArticleProps> = ({ article_id, process_col, date, priority }) => {
  const [url, setUrl] = useState("");
  const [title, setTitle] = useState("");
  const [pubDate, setPubDate] = useState("");
  const [body, setBody] = useState("");
  const [nlpMode, setNlpMode] = useState(false);
  const [titleNLP, setTitleNLP] = useState();

  const getArticleInfo = async (val: number) => {
    const data = exampleArticleData.getArticleContent;
    for (const datapoint in data) {
      const article_reviewdata_field_id = data[datapoint]["article_reviewdata_field_id"];
      if (article_reviewdata_field_id == 1) {
        setUrl(data[datapoint]["value"]);
      } else if (article_reviewdata_field_id == 2) {
        setTitle(data[datapoint]["value"]);
        setTitleNLP(data[datapoint]);
      } else if (article_reviewdata_field_id == 3) {
        setBody(data[datapoint]["value"]);
      } else if (article_reviewdata_field_id == 4) {
        setPubDate(data[datapoint]["value"]);
      } else if (article_reviewdata_field_id == 5) {
        setBody(data[datapoint]["value"]);
      } else {
        console.log("failed match");
      }
    }
    return data;
  };
  // Match URLs

  useEffect(() => {
    getArticleInfo(article_id);
  }, [article_id]);

  const [tabValue, setTabValue] = useState(0);
  const handleChange = (event: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleClick = () => {
  };

  const changeNlp = () => {
    setNlpMode(!nlpMode);
  };

  return (
    <Grid container spacing={2}>
      <Grid xs={12}>
        <LinearProgress variant="determinate" value={60} />
        <Card>
          <CardContent>
            Article ID: {article_id}
            <br />
            Process: {process_col}
            <br />
            Collected on: {date}
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={7}>
        <Card>
          <Box style={{ backgroundColor: 'lightgrey' }}>
            <FormGroup row sx={{ marginLeft: '10px' }}>
              <FormControlLabel control={<Checkbox checked={nlpMode} onChange={changeNlp} sx={{ height: '30px' }} />} label="NLP Mode" />
              <FormControlLabel control={<Checkbox sx={{ height: '30px' }} />} label="Original Language" />
            </FormGroup>
          </Box>
          <CardContent>
            <Typography variant="h6" component="div">Article Data</Typography>
            <Tabs value={tabValue} onChange={handleChange}>
              <Tab label="Datapoints" id="simple-tab-1" />
              <Tab label="Content" id="simple-tab-1" />
              <Tab label={
                <span>
                  {"Website"}
                  <IconButton size="small" onClick={() => { handleClick(); }}></IconButton>
                </span>

              } id="simple-tab-1" />

              <Link
                href={url}
                rel="epiwatch"
                target="_blank"
                replace
              >
                <IconButton><PublicSharpIcon /></IconButton>
              </Link>
            </Tabs>
            <CustomTabPanel value={tabValue} index={0}>
              <p>
                <b>url:</b><br />
                {url}
              </p>
              <p>
                <b>title:</b><br />
                {nlpMode ? highlightText(title) : <>{title}</>}
              </p>
              <p>
                <b>publication-date:</b><br />
                {pubDate}
              </p>
            </CustomTabPanel>
            <CustomTabPanel value={tabValue} index={1}><div dangerouslySetInnerHTML={{ __html: body }} /></CustomTabPanel>
            <CustomTabPanel value={tabValue} index={2}> <iframe src={url} width={"100%"} height={"px"} /></CustomTabPanel>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={5}>
        <Card>
          <CardContent>
            <Typography variant="h6" component="div" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '4vh' }}>Reports <PrioChip value={priority} /></Typography>
            <Card>
              <ReportGUI />
            </Card>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
};

export default ArticleEditor;