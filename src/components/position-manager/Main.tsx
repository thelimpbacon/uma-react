import React from 'react'
import { Box, Tab, Tabs, withStyles, styled } from '@material-ui/core'

import { Deposit, Mint, Redeem, Withdraw } from './views'

const StyledTabs = styled(Tabs)({
    textAlign: 'center',
    borderRight: '0.1px solid white',
    display: 'table',
})

export const PositionManager: React.FC = () => {
    const [tab, setTab] = React.useState(0)

    const handleTabChange = (event: any, newValue: number) => {
        // TODO Improve any
        setTab(newValue)
    }

    return (
        <React.Fragment>
            <StyledTabs orientation="vertical" value={tab} onChange={handleTabChange}>
                <StyledTab label="Mint" {...a11yProps(0)} />
                <StyledTab label="Deposit" {...a11yProps(1)} />
                <StyledTab label="Withdraw" {...a11yProps(2)} />
                <StyledTab label="Redeem" {...a11yProps(3)} />
            </StyledTabs>
            <Box width="100%" justifyContent="center" alignItems="center" display="flex">
                <TabPanel value={tab} index={0}>
                    <Mint />
                </TabPanel>
                <TabPanel value={tab} index={1}>
                    <Deposit />
                </TabPanel>
                <TabPanel value={tab} index={2}>
                    <Withdraw />
                </TabPanel>
                <TabPanel value={tab} index={3}>
                    <Redeem />
                </TabPanel>
            </Box>
        </React.Fragment>
    )
}

const StyledTab = withStyles((theme) => ({
    root: {
        textTransform: 'none',
        color: '#e13938',
        fontWeight: theme.typography.fontWeightRegular,
        fontSize: theme.typography.pxToRem(15),
        '&:focus': {
            opacity: 1,
            fontWeight: '500',
        },
        '&.Mui-selected': {
            fontWeight: '500',
            fontSize: '1em',
        },
    },
}))((props: any) => <Tab disableRipple {...props} />)

const a11yProps = (index: any) => {
    return {
        id: `vertical-tab-${index}`,
        'aria-controls': `vertical-tabpanel-2-${index}`,
    }
}

const TabPanel = (props: any) => {
    // TODO improve typing

    const { children, value, index, ...other } = props

    return (
        <Box
            height="100%"
            width="100%"
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && <Box margin="2em 1em 1em 2em">{children}</Box>}
        </Box>
    )
}
