import * as React from "react";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import { useRouter } from "next/router";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Props } from "@/types";
import Link from "next/link";
import Image from "next/image";
import longLogo from "../../public/ews-long-logo.svg";
import Head from "next/head";
import Script from "next/script";
import { MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { EpiwatchRoutes } from "@/components/constant";
import { useTranslation } from "react-i18next";

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  position: "fixed",
  zIndex: 1,
  ...(open == true && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(open == false && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const allRoutes = EpiwatchRoutes.map((item, i) => {
  return { ...item, index: i };
});

const PublicLayout = ({ children }: Props) => {
  const router = useRouter();
  const { t, i18n } = useTranslation();
  const matchRoute = allRoutes.filter((item) => item.path === router.route)[0]
    .index;
  const accessRoutes = allRoutes.filter((item) => item.name !== null && item.icon !== null);
  const [selectedIndex, setSelectedIndex] = useState<number>(matchRoute);
  const [open, setOpen] = useState<boolean>(false);
  const [selectedLang, setSelectedLang] = useState<string>(i18n.language);

  const languages = ["en", "hi"];

  useEffect(() => {
    const currRouteIndex = allRoutes.filter(
      (item) => item.path === router.route,
    )[0].index;
    if (currRouteIndex !== selectedIndex) {
      setSelectedIndex(currRouteIndex);
    }
  }, [router.pathname, router.route, selectedIndex]);

  useEffect(() => {
    if (typeof window !== "undefined" && window.localStorage !== undefined) {
      let storedLang = localStorage.getItem("selectedLang");
      if (storedLang == null || !languages.includes(storedLang)) {
        localStorage.setItem("selectedLang", languages[0]);
        storedLang = languages[0];
      }
      if (storedLang !== selectedLang) {
        setSelectedLang(storedLang);
        i18n.changeLanguage(storedLang);
      }
    }
  }, []);

  const handleListItemClick = async (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
    index: number | undefined,
  ) => {
    if (index !== undefined) {
      setSelectedIndex(index);
      await router.replace(allRoutes[index].path);
    }
  };

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Script
        id="google-tag-manager"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}`}
      />
      <Script id="google-analytics-tag" strategy="lazyOnload">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS}', {
          page_path: window.location.pathname,
          });
        `}
      </Script>
      <Head>
        <title>{`EPIWATCH - ${t("navigation." + allRoutes[selectedIndex].name)}`}</title>
        <meta name="description" content="EPIWATCH" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box sx={{ display: "flex" }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          open={open}
          color="inherit"
          elevation={3}
          sx={{ borderBottom: "2px solid rgb(16,28,84)" }}
        >
          <Toolbar>
            <div style={{ marginLeft: "-5px" }}>
              <Link
                href={"https://www.epiwatch.org/"}
                rel="epiwatch"
                target="_self"
                replace
              >
                <Image
                  src={longLogo.src}
                  width={200}
                  height={50}
                  id="app-bar-logo"
                  alt="logo"
                  priority
                />
              </Link>
            </div>
            <div style={{ marginLeft: "8px" }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: "bold", float: "left", paddingTop: "6px" }}
                gutterBottom
              >
                / {t("navigation." + allRoutes[selectedIndex].name)}
              </Typography>
            </div>
            <Box sx={{ flexGrow: 1 }}></Box>
            <Select
              sx={{ marginRight: "10px" }}
              size="small"
              id="manual-user-select"
              label="Change language"
              value={selectedLang}
              onChange={(event: SelectChangeEvent) => {
                localStorage.setItem("selectedLang", event.target.value);
                router.reload();
              }}
            >
              <MenuItem value={"en"}>en</MenuItem>
              <MenuItem value={"hi"}>hi</MenuItem>
            </Select>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          sx={{ height: "100vh" }}
          PaperProps={{
            sx: {
              backgroundColor: "rgb(16,28,84)",
            },
          }}
          open={open}
          onMouseOver={handleDrawerOpen}
          onMouseLeave={handleDrawerClose}
        >
          <DrawerHeader sx={{ marginBottom: "-7px" }} />
          <Divider />
          <List>
            {accessRoutes.map((route) => (
              <ListItem key={route.index} disablePadding>
                <ListItemButton
                  selected={selectedIndex === route.index}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    "&:hover": {
                      backgroundColor: "rgb(9, 16, 64)",
                    },
                    "&.Mui-selected": {
                      backgroundColor: "rgb(255, 255, 255, 1)",
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: "rgb(255, 255, 255, 0.8)",
                    },
                  }}
                  onClick={(event) => handleListItemClick(event, route.index)}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                      color:
                        selectedIndex !== route.index
                          ? "white"
                          : "rgb(16,28,84)",
                    }}
                  >
                    {route.icon !== null && <route.icon />}
                  </ListItemIcon>
                  <ListItemText
                    primary={t("navigation." + route.name)}
                    sx={{
                      opacity: open ? 1 : 0,
                      color:
                        selectedIndex !== route.index
                          ? "white"
                          : "rgb(16,28,84)",
                    }}
                    primaryTypographyProps={{
                      fontWeight: selectedIndex !== route.index ? 440 : 450,
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Drawer>
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "background.default",
            marginLeft: "265px",
            zIndex: 0,
            height: "calc(100vh - 65px)",
            marginRight: "200px",
            marginY: "20px",
          }}
        >
          <DrawerHeader />
          <>{children}</>
        </Box>
      </Box>
    </div>
  );
};

export default PublicLayout;
