import React from "react";
import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Font
} from "@react-pdf/renderer";

// TAMIL FONT REGISTER
Font.register({
  family: "TamilFont",
  src: "/fonts/NotoSansTamil-Regular.ttf"
});

Font.register({
  family: "TamilFontBold",
  src: "/fonts/NotoSansTamil-Bold.ttf"
});

// PDF STYLES
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontFamily: "TamilFont"
  },
  title: {
    fontSize: 22,
    textAlign: "center",
    marginBottom: 20,
    fontFamily: "TamilFontBold",
    color: "#1a1a1a"
  },
  table: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#000"
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e6e6e6",
    borderBottomWidth: 1,
    borderColor: "#000",
    padding: 6
  },
  headerCell: {
    fontSize: 12,
    fontFamily: "TamilFontBold",
    width: "25%",
    textAlign: "center"
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#d9d9d9"
  },
  rowAlt: {
    flexDirection: "row",
    backgroundColor: "#f7f7f7",
    borderBottomWidth: 1,
    borderColor: "#d9d9d9"
  },
  cell: {
    fontSize: 11,
    padding: 6,
    width: "25%",
    textAlign: "center"
  }
});

const ProductPDF = ({ products }) => {
  // ✔ SORT PRODUCTS BY PRODUCT CODE (sno)
  const sortedProducts = [...products].sort((a, b) => {
    const aNum = parseInt(a.sno.replace(/^\D+/g, "")); // ab15 → 15
    const bNum = parseInt(b.sno.replace(/^\D+/g, "")); // ab7 → 7
    return aNum - bNum;
  });

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <Text style={styles.title}>பொருட்கள் பட்டியல் (Product List)</Text>

        <View style={styles.table}>

          <View style={styles.tableHeader}>
            <Text style={styles.headerCell}>எண்</Text>
            <Text style={styles.headerCell}>பெயர்</Text>
            <Text style={styles.headerCell}>விலை</Text>
            <Text style={styles.headerCell}>வகை</Text>
          </View>

          {sortedProducts.map((p, index) => (
            <View
              key={p.id}
              style={index % 2 === 0 ? styles.row : styles.rowAlt}
            >
              <Text style={styles.cell}>{p.sno}</Text>
              <Text style={styles.cell}>{p.name}</Text>
              <Text style={styles.cell}>Rs. {p.saleprice}</Text>
              <Text style={styles.cell}>{p.category}</Text>
            </View>
          ))}

        </View>
      </Page>
    </Document>
  );
};

export default ProductPDF;
