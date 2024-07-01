import { useEffect, useState } from 'react';
import { Country, Disease, Syndrome, Report } from '@/types';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Grid from '@mui/material/Grid';
import dayjs, { Dayjs } from 'dayjs';
import { compareText } from '../utils/dataUtils';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { DateFormat } from '@/components/utils/constant';
import Box from '@mui/material/Box';
import CardContent from '@mui/material/CardContent';
import IconButton from '@mui/material/IconButton';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import FormGroup from '@mui/material/FormGroup';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import ClearIcon from '@mui/icons-material/Clear';
import FlagIcon from '@mui/icons-material/Flag';


const defaultCountry = {
  id: "11",
  country_name: "Australia",
  iso3: "AUS",
  lat: -35.282,
  long: 149.129,
};
const exampleReport = {
  id: 10,
  location: "Australia",
};

const today = dayjs();

const ReportGUI = () => {
  const [countries, setCountries] = useState([]);
  const [diseases, setDiseases] = useState<Disease[]>([]);
  const [syndromes, setSyndromes] = useState<Syndrome[]>([]);
  const [country, setCountry] = useState<Country>(defaultCountry);
  const [pubDate, setPubDate] = useState<Dayjs>(today);
  const [eventDate, setEventDate] = useState<Dayjs>(today);
  const [selectedDiseases, setSelectedDiseases] = useState<Disease[]>([]);
  const [selectedSyndromes, setSelectedSyndromes] = useState<Syndrome[]>([]);
  const [url, setURl] = useState("");
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [reports, setReports] = useState<Report[]>([exampleReport]);
  const [clicked, setClicked] = useState(null);


  const handleReportClick = (index: any) => {
    if (index == clicked) {
      setClicked(null);
    } else {
      setClicked(index);
    }
  };

  const handleNewReport = () => {
    const newReport = {
      id: reports.length + 1,
      location: "Australia"
    };
    setReports((prevReports) => [...prevReports, newReport]);
  };

  const handleDeleteReport = () => {
    if (clicked !== null) {
      setReports((prev) => prev.filter((_, index) => index !== clicked));
      setClicked(null);
    }

  };

  const loadData = async () => {
    try {
      const getCountries = () =>
        Promise.resolve(
          fetch(
            process.env.NEXT_PUBLIC_API_URL + "/countries"
          )
            .then((res) => {
              if (res && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                obj.sort(
                  (a: Country, b: Country) => compareText(a.country_name, b.country_name)
                );
                setCountries(obj);
                const defaultCountry = obj.filter(
                  (countryData: Country) =>
                    countryData.country_name == "Australia",
                );
                if (defaultCountry !== null && defaultCountry.length > 0) {
                  setCountry(defaultCountry[0]);
                }
              }
            }),
        );
      const getDiseases = () =>
        Promise.resolve(
          fetch(
            process.env.NEXT_PUBLIC_API_URL + "/disease",
          )
            .then((res) => {
              if (res !== null && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                obj.sort(
                  (a: Disease, b: Disease) => compareText(a.disease, b.disease)
                );
                setDiseases(obj);
              }
            }),
        );
      const getSyndromes = () =>
        Promise.resolve(
          fetch(
            process.env.NEXT_PUBLIC_API_URL + "/syndrome"
          )
            .then((res) => {
              if (res !== null && res.status === 200) {
                return res.json();
              } else {
                return null;
              }
            })
            .then((obj) => {
              if (obj !== null && obj.length > 0) {
                obj.sort(
                  (a: Syndrome, b: Syndrome) => compareText(a.syndrome, b.syndrome)
                );
                setSyndromes(obj);
              }
            }),
        );

      Promise.allSettled([
        getCountries(),
        getDiseases(),
        getSyndromes()
      ]);
    } catch (e: unknown) {
      console.log(e);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return <Box>
    <Card>
      <Box style={{ backgroundColor: 'lightgrey' }}>
        <FormGroup row sx={{ marginLeft: '8px' }}>
          <Chip size="small" icon={<InsertDriveFileIcon />} label="New" clickable onClick={handleNewReport} style={{ background: 'white', margin: '5px' }} />
          <Chip size="small" icon={<DeleteIcon />} label="Delete" disabled={clicked === null} clickable onClick={handleDeleteReport} style={{ background: 'white', margin: '5px' }} />
          <Chip size="small" icon={<SaveIcon color='success' />} label="Save" clickable style={{ background: 'white', margin: '5px' }} />
          <Chip size="small" icon={<FlagIcon />} label="Flag" clickable style={{ background: 'white', margin: '5px' }} />
          <Chip size="small" icon={<ClearIcon color='error' />} label="Unverified" clickable style={{ background: 'white', margin: '5px' }} />
        </FormGroup>
      </Box>
      {reports.map((item, index) => (
        <IconButton
          key={index}
          color={clicked === index ? 'primary' : 'default'}
          onClick={() => handleReportClick(index)}
        >
          <InsertDriveFileIcon fontSize="large" />
        </IconButton>
      ))}
      <IconButton color='primary'>
      </IconButton>
    </Card>

    <CardContent hidden={clicked == null}>
      <Grid>
        <TextField
          required
          id="url"
          label="URL"
          size="small"
          defaultValue={url}
          placeholder={url}
          name="url"
          autoFocus
          sx={{ width: '97.5%', margin: '8px' }}
        />
      </Grid>

      <Grid xs={12} md={6}>
        <TextField
          margin="normal"
          defaultValue={title}

          placeholder={title}
          required
          size="small"

          id="title"
          label="Title"
          name="title"
          sx={{ width: '97.5%', margin: '8px' }}

        />
      </Grid>
      <Grid>
        <Autocomplete
          multiple
          size="small"
          id="diseases"
          options={diseases}
          getOptionLabel={(option: Disease) => option.disease}
          includeInputInList
          sx={{ maxHeight: "150px", overflow: 'auto', overflowX: 'hidden' }}
          disableCloseOnSelect
          value={selectedDiseases}
          style={{ flexGrow: 1, margin: '8px', marginBottom: '15px' }}

          isOptionEqualToValue={(option: Disease, value: Disease) => {
            return option.id === value.id;
          }}
          onChange={(_event, newValue: readonly Disease[]) => {
            const mutableDiseases = [...newValue];
            setSelectedDiseases(mutableDiseases);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Disease(s)" />
          )}
        />
      </Grid>
      <Grid>
        <Autocomplete
          multiple
          size="small"
          id="syndromes"
          options={syndromes}
          getOptionLabel={(option: Syndrome) => option.syndrome}
          includeInputInList
          autoComplete
          disableCloseOnSelect
          style={{ flexGrow: 1, margin: '8px', marginBottom: '15px' }}
          value={selectedSyndromes}
          isOptionEqualToValue={(option: Syndrome, value: Syndrome) =>
            option.id === value.id
          }
          onChange={(_event, newValue: readonly Syndrome[]) => {
            const mutableSyndromes = [...newValue];
            setSelectedSyndromes(mutableSyndromes);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Syndrome(s)" />
          )}
        />
      </Grid>
      <Grid>
        <Autocomplete
          id="countries"
          options={countries}
          getOptionLabel={(option: Country) =>
            `${option.country_name} (${option.iso3})`
          }
          size="small"
          style={{ flexGrow: 1, margin: '8px' }}
          includeInputInList
          autoComplete
          disableClearable
          value={country}
          isOptionEqualToValue={(option: Country, value: Country) => option.iso3 === value.iso3}
          onChange={(_event, newValue: Country) => {
            setCountry(newValue);
          }}
          renderInput={(params) => (
            <TextField {...params} label="Country" />
          )}
        />
      </Grid>


      <Grid xs={12} md={6}>
        <DatePicker
          maxDate={today}
          format={DateFormat}
          label="Publication Date"
          sx={{ width: '47.2%', flexGrow: 1, margin: '8px' }}

          slotProps={{ textField: { size: "small" } }}
          value={pubDate}
          onChange={(newValue) => setPubDate(newValue as Dayjs)}
        />
        <DatePicker
          maxDate={today}
          format={DateFormat}
          label="Event Date"
          sx={{ width: '47.2%', flexGrow: 1, margin: '8px' }}
          slotProps={{ textField: { size: "small" } }}
          value={eventDate}
          onChange={(newValue) => setEventDate(newValue as Dayjs)}
        />
      </Grid>
      <Grid xs={12} md={6}>
        <TextField
          id="comment"
          defaultValue={comment}
          label="Comments"
          name="comments"
          size="medium"
          sx={{ width: '98%', flexGrow: 1, margin: '8px' }}
        />
      </Grid>
    </CardContent>
  </Box>;

};

export default ReportGUI;