import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import DatasetIcon from "@mui/icons-material/Dataset";
import SignalCellularAltIcon from "@mui/icons-material/SignalCellularAlt";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import styles from "../styles/Layout.module.css";
import { useRouter } from "next/router";
import dayjs from "dayjs";

const drawerWidth = 256;

const Routes = [
  {
    index: 0,
    name: "Map",
    icon: LocationOnIcon,
    path: "/map",
  },
  {
    index: 1,
    name: "Stats",
    icon: SignalCellularAltIcon,
    path: "/stats",
  },
  {
    index: 2,
    name: "Dataset",
    icon: DatasetIcon,
    path: "/datasets",
  },
];

const PublicLayout = ({ children }: any) => {
  const router = useRouter();

  const matchRoute = Routes.filter((item) => item.path === router.route)[0]
    .index;
  const [selectedIndex, setSelectedIndex] = React.useState(matchRoute);

  const handleListItemClick = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number,
  ) => {
    setSelectedIndex(index);
    await router.replace(Routes[index].path);
  };

  return (
    <div>
      <Head>
        <title>{`EPIWATCH - ${Routes[selectedIndex].name}`}</title>
        <meta name="description" content="EPIWATCH Reports Table" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ display: "flex" }}>
        <Drawer
          sx={{
            height: "100vh",
            width: drawerWidth,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
          variant="permanent"
          anchor="left"
          PaperProps={{
            sx: {
              backgroundColor: "rgb(25, 33, 76)",
            },
          }}
        >
          <Link
            href={"https://www.epiwatch.org/"}
            rel="epiwatch"
            target="_self"
            replace
          >
            <Image
              className={styles.logo}
              src="https://www.epiwatch.org/general/epiwatch-logo-2.svg"
              width={210}
              height={150}
              alt="logo"
              priority
            />
          </Link>
          <List className={styles.list}>
            {Routes.map((route, index) => (
              <ListItem key={index} disablePadding>
                <ListItemButton
                  selected={selectedIndex === index}
                  sx={{
                    "&.Mui-selected": {
                      backgroundColor: "rgb(250, 250, 250,.30)",
                    },
                  }}
                  onClick={(event) => handleListItemClick(event, index)}
                >
                  <ListItemIcon sx={{ color: "white" }}>
                    <route.icon />
                  </ListItemIcon>
                  <ListItemText sx={{ color: "white" }} primary={route.name} />
                </ListItemButton>
              </ListItem>
            ))}

            <div className={styles.info}>
              <InfoOutlinedIcon className={styles.infoIcon} />
              <span>
                Dashboard data limited from {dayjs().format("YYYY-MM-DD")}
              </span>
            </div>
          </List>
        </Drawer>

        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: "background.default" }}
        >
          {children}
        </Box>
      </Box>
    </div>
  );
};

export default PublicLayout;
