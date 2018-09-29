import { Dimensions, StyleSheet } from 'react-native';

export default StyleSheet.create({
  container: {
    flex: 1,
  },
  card: {
    backgroundColor: '#FFF',
    flexDirection: 'column',
    justifyContent: 'center',
    margin: 20,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 4,
    shadowOpacity: 0.3,
    shadowColor: '#AAA',
    shadowOffset: { width: 0, height: 4 },
  },
  smallImage: {
    width: Dimensions.get('window').width - 40,
    height: Dimensions.get('window').width - 60,
  },
  imageHeader: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarImage: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  avatarSmallImage: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  avatarText: {
    fontSize: 11,
    marginLeft: 8,
  },
  bigCard: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#FFF',
    justifyContent: 'flex-start',
  },
  bigImage: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width,
  },
  commentsContainer: {
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    paddingVertical: 6,
  },
  comment: {
    fontSize: 11,
    paddingLeft: 6,
  },
  buttons: {
    flexDirection: 'row',
    padding: 10,
    paddingTop: 50,
  },
});
