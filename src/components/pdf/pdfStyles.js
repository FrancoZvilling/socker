import { StyleSheet } from '@react-pdf/renderer';

export const pdfStyles = StyleSheet.create({
  page: {
    fontFamily: 'Times-Roman', // Fuente Serif para un look más clásico
    fontSize: 10,
    backgroundColor: '#ffffffff', // Un fondo blanco hueso muy sutil
    color: '#5C5451', // Color de texto principal (marrón oscuro)
    padding: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 40,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  headerTitle: {
    fontSize: 32,
    color: '#5C5451',
    fontFamily: 'Times-Bold',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#5C5451',
    marginTop: 4,
  },
  logoContainer: {
    width: 140,
    height: 70,
    backgroundColor: '#F9F5F1', // Fondo del contenedor del logo
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  logo: {
    width: 120,
    height: 60,
    objectFit: 'contain',
  },
  table: {
    display: 'table',
    width: 'auto',
    marginTop: 30,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    alignItems: 'center',
  },
  tableColHeader: {
    padding: 8,
    backgroundColor: '#F9F5F1', // Fondo de cabeceras
    flex: 1,
  },
  tableCol: {
    padding: 8,
    flex: 1,
  },
  tableCellHeader: {
    fontSize: 11,
    fontFamily: 'Times-Bold',
    color: '#333',
  },
  tableCell: {
    fontSize: 10,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  totalBox: {
    backgroundColor: '#F9F5F1',
    padding: '8px 15px',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 5,
  },
  totalText: {
    fontSize: 12,
    fontFamily: 'Times-Bold',
    marginRight: 20,
    color: '#333',
  },
  totalAmount: {
    fontSize: 14,
    fontFamily: 'Times-Bold',
    color: '#333',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#888',
    fontSize: 9,
  },
  companyNameFooter: {
    position: 'absolute',
    bottom: 60,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#5C5451',
    fontSize: 18,
    fontFamily: 'Times-Bold',
  }
});