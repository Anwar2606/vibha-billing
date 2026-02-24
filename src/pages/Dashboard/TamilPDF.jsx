import React from "react";
import {
  Page,
  Text,
  Image,
  View,
  Document,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

import logo from "../assets/vibha-logo.png";
import watermark from "../assets/vibha-logo.png";

// ---------------- FONT REGISTER ----------------
Font.register({
  family: "English",
  src: "/fonts/Roboto-Regular.ttf",
});

Font.register({
  family: "EnglishBold",
  src: "/fonts/Roboto-Bold.ttf",
  fontWeight: "bold",
});

// ---------------- NUMBER TO WORDS ----------------
function numberToWords(num) {
  if (!Number.isFinite(num)) return "";
  num = Math.floor(num);

  const ones = ["Zero","One","Two","Three","Four","Five","Six","Seven","Eight","Nine"];
  const teens = ["Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen",
                 "Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];

  if (num === 0) return "Zero";

  function convertHundreds(n) {
    let out = "";
    if (n > 99) {
      out += ones[Math.floor(n / 100)] + " Hundred ";
      n = n % 100;
    }
    if (n >= 20) {
      out += tens[Math.floor(n / 10)] + " ";
      n = n % 10;
    }
    if (n >= 10 && n <= 19) {
      return out + teens[n - 10];
    }
    if (n > 0) out += ones[n];
    return out.trim();
  }

  let word = "";
  const thousandNames = ["", "Thousand", "Million", "Billion"];
  let counter = 0;

  while (num > 0) {
    const chunk = num % 1000;
    if (chunk > 0) {
      word = `${convertHundreds(chunk)} ${thousandNames[counter]} ${word}`;
    }
    num = Math.floor(num / 1000);
    counter++;
  }

  return word.trim();
}

// ---------------- STYLES ----------------
const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontSize: 10,
    fontFamily: "English",
  },

  outerBox: {
    border: "1pt solid #000",
    minHeight: "98%",
    padding: 8,
    position: "relative",
  },

  watermark: {
    position: "absolute",
    width: 260,
    height: 160,
    opacity: 0.06,
    left: "50%",
    marginLeft: -130,
    top: "50%",
    marginTop: -130,
  },

  // HEADER
  header: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    paddingBottom: 6,
  },

  headerLeft: { width: "20%" },
  headerCenter: { width: "50%", textAlign: "center" },
  headerRight: { width: "30%", textAlign: "right" },

  logo: { width: 80, height: 65 },

  shopTitle: {
    fontSize: 16,
    fontFamily: "EnglishBold",
    color: "#0089cd",
  },

  address: {
    fontSize: 9,
    marginTop: 3,
  },

  phoneNo: {
    fontFamily: "EnglishBold",
    fontSize: 10,
  },

  billMeta: {
    marginTop: 4,
    fontFamily: "EnglishBold",
  },

  fssai: {
    fontSize: 8,
    marginTop: 3,
  },

  // CUSTOMER BLOCK
customerBlock: {
  marginTop: 12,
  borderBottom: "1pt solid #000",
  paddingBottom: 12,
  paddingHorizontal: 6,   // ⭐ adds left/right air
},
customerGridRow: {
  flexDirection: "row",
  marginTop: 8,           // ⭐ better row spacing
},
customerCol: {
  width: "50%",
  flexDirection: "row",
  paddingRight: 10,       // ⭐ space between columns
},

label: {
  width: "38%",           // ⭐ slightly tighter label
  fontFamily: "EnglishBold",
  fontSize: 10,
},

value: {
  width: "62%",
  borderBottom: "0.8pt solid #000",
  paddingLeft: 6,         // ⭐ nicer text offset
  paddingBottom: 2,       // ⭐ avoids touching line
//   fontFamily: "EnglishBold",
},

  valueLine: {
    width: "70%",
    borderBottom: "0.8pt solid #000",
    paddingLeft: 4,
    fontFamily: "EnglishBold",
  },

  // TABLE
  tableBox: {
    marginTop: 10,
    border: "1pt solid #000",
  },

  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#e6eef9",
    borderBottom: "1pt solid #000",
    fontFamily: "EnglishBold",
  },

  th: {
    padding: 6,
    borderRight: "1pt solid #000",
    textAlign: "center",
    fontFamily: "EnglishBold",
  },

  tr: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },

  td: {
    padding: 6,
    borderRight: "1pt solid #000",
  },

  words: {
    marginTop: 8,
    fontFamily: "EnglishBold",
  },

  termsBox: {
    border: "1pt solid #000",
    marginTop: 12,
    padding: 10,
  },
termsText: {
  lineHeight: 2,   // ⭐ adjust spacing here
  marginTop: 2,     // optional, improves breathing
},
  signature: {
    marginTop: 10,
    textAlign: "right",
    fontFamily: "EnglishBold",
  },

  thankText: {
    marginTop: 8,
    fontFamily: "EnglishBold",
    fontSize: 9,
    textAlign: "center",
  },
  totalsBox: {
  marginTop: 14,          // ⭐ proper gap from table
  width: "48%",           // ⭐ slightly wider = premium look
  alignSelf: "flex-end",
},

totalsRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 6,           // ⭐ clean vertical rhythm
  paddingBottom: 2,
  fontSize: 10,
},

totalsLabel: {
  fontFamily: "EnglishBold",
},

totalsValue: {
  fontFamily: "EnglishBold",
},

grandTotalRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginTop: 10,
  paddingTop: 6,
  borderTop: "1.2pt solid #000",  // ⭐ stronger separation
  fontSize: 12,                   // ⭐ emphasis
  fontFamily: "EnglishBold",
},
bankBox: {
  marginTop: 18,
  border: "1pt solid #000",
  padding: 10,
},

bankTitle: {
  fontFamily: "EnglishBold",
  fontSize: 11,
  marginBottom: 6,
},

bankRow: {
  flexDirection: "row",
  marginTop: 4,
},

bankLabel: {
  width: "35%",
  fontFamily: "EnglishBold",
  fontSize: 10,
},

bankValue: {
  width: "65%",
  fontSize: 10,
},
});

// ---------------- PDF ----------------
const TamilPDF = ({
  invoiceNumber = 1,
  cart = [],
  billingDetails = { grandTotal: 0 },

  customerName = "",
  customerPhoneNo = "",
  customerAddress = "",
  customerState = "",
  customerGSTIN = "",
  customerEmail = "",

  bankName = "Indian Bank",
  accountName = "VIBHA TRAINING AND CONSULTING",
  accountNumber = "10259086127",
  ifscCode = "IDFB0080591",
  upiId = "Salem",

  billDate,
  fssaiNo = "33ABBFV0989M1ZO",
}) => {  const computedTotal = cart.reduce(
    (sum, item) => sum + item.saleprice * item.quantity,
    0
  );

  const total = billingDetails.grandTotal || computedTotal;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.outerBox}>
          <Image src={watermark} style={styles.watermark} />

          {/* HEADER */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Image src={logo} style={styles.logo} />
              <Text style={styles.fssai}>Registration Number : {fssaiNo}</Text>
            </View>

            <View style={styles.headerCenter}>
              <Text style={styles.shopTitle}>
                VIBHA TRAINING AND CONSULTING
              </Text>

              <Text style={styles.address}>
                Sri Lakshmi Complex, Omalur Main Rd, Swarnapuri, Salem,
                {"\n"}Tamil Nadu 636004
              </Text>
            </View>

            <View style={styles.headerRight}>
              <Text style={styles.phoneNo}>88079 89727</Text>
              <Text style={styles.billMeta}>
                BILL NUMBER: {String(invoiceNumber).padStart(3, "0")}
              </Text>

              <Text style={styles.billMeta}>
                Date: {billDate ? billDate.toLocaleDateString("en-GB") : "N/A"}
              </Text>
            </View>
          </View>

          {/* CUSTOMER */}
        <View style={styles.customerBlock}>

  {/* ROW 1 */}
  <View style={styles.customerGridRow}>
    <View style={styles.customerCol}>
      <Text style={styles.label}>Customer Name:</Text>
      <Text style={styles.value}>{customerName || "N/A"}</Text>
    </View>

    <View style={styles.customerCol}>
      <Text style={styles.label}>Phone Number:</Text>
      <Text style={styles.value}>{customerPhoneNo || "N/A"}</Text>
    </View>
  </View>

  {/* ROW 2 */}
  <View style={styles.customerGridRow}>
    <View style={styles.customerCol}>
      <Text style={styles.label}>Address:</Text>
      <Text style={styles.value}>{customerAddress || "N/A"}</Text>
    </View>

    <View style={styles.customerCol}>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{customerEmail || "N/A"}</Text>
    </View>
  </View>

  {/* ROW 3 */}
  <View style={styles.customerGridRow}>
    <View style={styles.customerCol}>
      <Text style={styles.label}>State:</Text>
      <Text style={styles.value}>{customerState || "N/A"}</Text>
    </View>

    <View style={styles.customerCol}>
      <Text style={styles.label}>GSTIN:</Text>
      <Text style={styles.value}>{customerGSTIN || "N/A"}</Text>
    </View>
  </View>

</View>
          {/* TABLE */}
          <View style={styles.tableBox}>
            <View style={styles.tableHeader}>
              <Text style={[styles.th, { width: "10%" }]}>S.No</Text>
              <Text style={[styles.th, { width: "45%" }]}>Item</Text>
              <Text style={[styles.th, { width: "15%" }]}>Qty</Text>
              <Text style={[styles.th, { width: "15%" }]}>Rate</Text>
              <Text style={[styles.th, { width: "15%", borderRight: 0 }]}>
                Total
              </Text>
            </View>

            {cart.map((item, i) => (
              <View key={i} style={styles.tr}>
                <Text style={[styles.td, { width: "10%" }]}>{i + 1}</Text>
                <Text style={[styles.td, { width: "45%" }]}>{item.name}</Text>
                <Text style={[styles.td, { width: "15%" }]}>{item.quantity}</Text>
                <Text style={[styles.td, { width: "15%" }]}>
                  Rs. {item.saleprice}
                </Text>
                <Text style={[styles.td, { width: "15%", borderRight: 0 }]}>
                  Rs. {(item.quantity * item.saleprice).toFixed(2)}
                </Text>
              </View>
            ))}

       <View style={styles.totalsBox}>

  {/* <View style={styles.totalsRow}>
    <Text style={styles.totalsLabel}>Subtotal</Text>
    <Text style={styles.totalsValue}>
      Rs. {billingDetails.discountedTotal?.toFixed(2)}
    </Text>
  </View> */}

  {billingDetails.cgstAmount > 0 && (
    <View style={styles.totalsRow}>
      <Text style={styles.totalsLabel}>CGST (9%)</Text>
      <Text style={styles.totalsValue}>
        Rs. {billingDetails.cgstAmount.toFixed(2)}
      </Text>
    </View>
  )}

  {billingDetails.sgstAmount > 0 && (
    <View style={styles.totalsRow}>
      <Text style={styles.totalsLabel}>SGST (9%)</Text>
      <Text style={styles.totalsValue}>
        Rs. {billingDetails.sgstAmount.toFixed(2)}
      </Text>
    </View>
  )}

  {billingDetails.igstAmount > 0 && (
    <View style={styles.totalsRow}>
      <Text style={styles.totalsLabel}>IGST (18%)</Text>
      <Text style={styles.totalsValue}>
        Rs. {billingDetails.igstAmount.toFixed(2)}
      </Text>
    </View>
  )}

  <View style={styles.grandTotalRow}>
    <Text>Grand Total</Text>
    <Text>Rs. {total.toFixed(2)}</Text>
  </View>

</View>
          </View>

          {/* WORDS */}
          <Text style={styles.words}>
            Amount in Words: {numberToWords(total)} Rupees
          </Text>
<View style={styles.bankBox}>

  <Text style={styles.bankTitle}>Bank Details</Text>

  <View style={styles.bankRow}>
    <Text style={styles.bankLabel}>Bank Name :</Text>
    <Text style={styles.bankValue}>{bankName}</Text>
  </View>

  <View style={styles.bankRow}>
    <Text style={styles.bankLabel}>Account Name :</Text>
    <Text style={styles.bankValue}>{accountName}</Text>
  </View>

  <View style={styles.bankRow}>
    <Text style={styles.bankLabel}>Account Number</Text>
    <Text style={styles.bankValue}>{accountNumber}</Text>
  </View>

  <View style={styles.bankRow}>
    <Text style={styles.bankLabel}>IFSC Code</Text>
    <Text style={styles.bankValue}>{ifscCode}</Text>
  </View>

  <View style={styles.bankRow}>
    <Text style={styles.bankLabel}>Branch</Text>
    <Text style={styles.bankValue}>{upiId}</Text>
  </View>

</View>
          {/* TERMS */}
         <View style={styles.termsBox}>
  <Text style={{ fontFamily: "EnglishBold", marginBottom: 4 }}>
    Terms & Conditions
  </Text>

  <Text style={styles.termsText}>
    1. Admission is confirmed after payment. Fees are non-refundable.
  </Text>

  <Text style={styles.termsText}>
    2. Schedules and course content may change if required.
  </Text>

  <Text style={styles.termsText}>
    3. Materials are proprietary. Certification requires attendance and compliance.
  </Text>

  <Text style={styles.signature}>
    Authorised Signature
  </Text>
</View>

          <Text style={styles.thankText}>
            Thank you for your business
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default TamilPDF;