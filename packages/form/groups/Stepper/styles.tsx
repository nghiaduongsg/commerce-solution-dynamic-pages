export const getStyles = () => ({
  container: {
    marginTop: 0,
    marginBottom: 0,
    width: '100%',
  },
  stepContainer: {
    width: '100%',
    maxHeight: '500px',
    overflow: 'auto',
    overflowX: 'hidden',
    paddingTop: 16,
    paddingBottom: 16,
  },
  lowButtonsContainer: {
    marginTop: 16,
  },
  topButtonsContainer: {
    marginBottom: 16,
  },
  icon: {
    display: 'flex',
  },
});

export const getStepStyles = (theme) => ({
  completed: {
    border: `2px solid ${theme.palette?.success.main}`,
    borderRadius: '50%',
    width: 25,
    height: 25,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette?.common.white,
    backgroundColor: theme.palette?.success.main,
  },
  active: {
    border: `2px solid ${theme.palette?.primary.main}`,
    borderRadius: '50%',
    width: 25,
    height: 25,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette?.common.white,
    backgroundColor: theme.palette?.primary.main,
  },
  future: {
    border: `2px solid ${theme.palette?.primary.main}`,
    borderRadius: '50%',
    width: 25,
    height: 25,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette?.common.black,
    backgroundColor: theme.palette?.common.white,
  },
  invalid: {
    border: `2px solid ${theme.palette?.error.main}`,
    borderRadius: '50%',
    width: 25,
    height: 25,
    alignItems: 'center',
    display: 'flex',
    justifyContent: 'center',
    color: theme.palette?.common.white,
    backgroundColor: theme.palette?.error.main,
  },
});
