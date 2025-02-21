import { ContractReceipt, ethers } from 'ethers'

import { buildFakeEMP } from './fakers'
import { EMPData, EthereumAddress } from '../src/types'

import { create, deposit, redeem, requestWithdrawal } from '../src/utils/empCommands'
import { getUMAInterfaces } from '../src/utils/umaInterfaces'
import { deployEMP } from './test-utilities/deployEMP'
import { toWeiSafe } from '../src/utils/conversions'
import { getAllEMPData } from '../src/hooks'

describe.skip('empCommands', () => {
    let empAddress: EthereumAddress
    let signer: ethers.Signer
    let network: ethers.providers.Network
    let empInstance: ethers.Contract
    let empData: EMPData
    let injectedProvider: ethers.providers.Web3Provider
    let collateralInstance: ethers.Contract
    let syntheticInstance: ethers.Contract
    let collateralDecimals: number
    let tokenDecimals: number
    let userAddress: EthereumAddress
    beforeAll(async () => {
        injectedProvider = (global as any).ethersProvider
        network = await injectedProvider.getNetwork()
        signer = injectedProvider.getSigner()
        userAddress = await signer.getAddress()
        const sampleEMP = buildFakeEMP()
        const { expiringMultiPartyAddress } = await deployEMP(sampleEMP, network, signer)

        empAddress = expiringMultiPartyAddress
        const allInterfaces = getUMAInterfaces()
        empInstance = new ethers.Contract(expiringMultiPartyAddress, allInterfaces.get('ExpiringMultiParty') as ethers.utils.Interface, signer)
        empData = await getAllEMPData(empInstance)
        collateralInstance = new ethers.Contract(empData.collateralCurrency, allInterfaces.get('ERC20'), signer)
        syntheticInstance = new ethers.Contract(empData.tokenCurrency, allInterfaces.get('ERC20'), signer)
        collateralDecimals = await getTokenDecimals(collateralInstance)
        tokenDecimals = await getTokenDecimals(syntheticInstance)

        console.log('collateralDecimals', collateralDecimals)
        console.log('tokenDecimals', tokenDecimals)

        const maxAllowanceReceiptForCollateral = await setMaxAllowance(collateralInstance, empAddress)
        if (!maxAllowanceReceiptForCollateral) {
            throw new Error("Couldn't set max allowance for collateral")
        }

        const maxAllowanceReceiptForToken = await setMaxAllowance(syntheticInstance, empAddress)
        if (!maxAllowanceReceiptForToken) {
            throw new Error("Couldn't set max allowance for token")
        }
    })

    const getTokenDecimals = async (contractInstance: ethers.Contract): Promise<number> => {
        return await contractInstance.decimals()
    }

    const setMaxAllowance = async (contractInstance: ethers.Contract, empAddressParameter: EthereumAddress): Promise<ContractReceipt> => {
        const receipt = await contractInstance.approve(empAddressParameter, ethers.constants.MaxUint256)
        await receipt.wait()
        return receipt
    }

    test('create', async () => {
        const numberOfCollateral = 1000
        const numberOfTokens = 100

        const result = await create(
            empInstance,
            toWeiSafe(numberOfCollateral.toString(), collateralDecimals),
            toWeiSafe(numberOfTokens.toString(), tokenDecimals),
        )

        expect(result).toBeDefined()
    })

    test.skip('deposit', async () => {
        const newCollateralToDeposit = 100
        const depositResult = await deposit(empInstance, toWeiSafe(newCollateralToDeposit.toString(), collateralDecimals))
        expect(depositResult).toBeDefined()
    })

    test.skip('withdraw', async () => {
        const numberOfCollateral = 1000
        const numberOfTokens = 100

        const result = await create(
            empInstance,
            toWeiSafe(numberOfCollateral.toString(), collateralDecimals),
            toWeiSafe(numberOfTokens.toString(), tokenDecimals),
        )

        expect(result).toBeDefined()
        const position = await empInstance.positions(userAddress)
        console.log('Position', position)
        const collateralToWithdraw = 100
        const withdrawResult = await requestWithdrawal(empInstance, toWeiSafe(collateralToWithdraw.toString(), collateralDecimals))
        expect(withdrawResult).toBeDefined()
    })

    test.skip('redeem', async () => {
        // issue with pending withdrawal
        const numberOfCollateral = 1000
        const numberOfTokens = 100

        const result = await create(
            empInstance,
            toWeiSafe(numberOfCollateral.toString(), collateralDecimals),
            toWeiSafe(numberOfTokens.toString(), tokenDecimals),
        )

        expect(result).toBeDefined()

        const tokensToRedeem = 100
        const redeemResult = await redeem(empInstance, toWeiSafe(tokensToRedeem.toString(), tokenDecimals))
        expect(redeemResult).toBeDefined()
    })
})
