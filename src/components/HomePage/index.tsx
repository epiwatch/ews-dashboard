import React from "react";
import Typography from "@mui/material/Typography";
import { Box } from "@mui/material";
import styles from "../../styles/Home.module.css";
import { useTranslation } from "react-i18next";

const HomePage = () => {
  const { t } = useTranslation();
  return (
    <Box className={styles.box}>
      <Box className={styles.textSection}>
        <Typography className={styles.titleSection}>
          {t("home.heading")}
        </Typography>
        <Typography className={styles.paraSection}>
          {t("home.subtitle")}
        </Typography>
      </Box>
      <Box className={styles.container}></Box>
    </Box>
  );
};

export default HomePage;
