/*

	`Boundless Galaxy` @plrspro
	
	General notes:
	FOMO TCG
	EXPLORE, COLONIZE, ENCHANT, TRADE

	Officially hosted over http://galaxy.plrs.pro/

*/

/*

	Technical notes:
	1. The UInt64 value type represents unsigned integers with values ranging from 0 to 18,446,744,073,709,551,615. 
	2. Galaxy limitations obstructed for simplicity equalst to values ranging from 0 to 1 000 000 000 000 000 (due to js MAX_INT_VALUE)
	3. 1 DERO = 1000000000000 value
	4. Planet Generation variables:
		`
		setoff.RARECloudiness = 1; // 0-100
		setoff.RARECold = 1; // 0-100
		setoff.RAREOcean = 1; // 0-100
		setoff.RARETemperate = 1; // 0-100
		setoff.RAREWarm = 1; // 0-100
		setoff.RAREHot = 1; // 0-100
		setoff.RARESpeckle = 1; // 0-100
		setoff.RAREClouds = 1; // 0-100
		setoff.RARELightColor = 1; // 0-100

		setoff.vWaterLevel = 0; // 0-40
		setoff.vRivers = 0; // 0-100
		setoff.vTemperature = 0; // 0-40
		setoff.vCloudiness = 0; // 0-20

		setoff.vCold_r = 44; // 0-100
		setoff.vCold_g = 13; // 0-100
		setoff.vCold_b = 14; // 0-100

		setoff.vOcean_r = 17; // 0-100
		setoff.vOcean_g = 18; // 0-100
		setoff.vOcean_b = 19; // 0-100

		setoff.vTemperate_r = 60; // 0-100
		setoff.vTemperate_g = 70; // 0-100
		setoff.vTemperate_b = 10; // 0-100

		setoff.vWarm_r = 60; // 0-100
		setoff.vWarm_g = 60; // 0-100
		setoff.vWarm_b = 60; // 0-100

		setoff.vHot_r = 60; // 0-100
		setoff.vHot_g = 60; // 0-100
		setoff.vHot_b = 60; // 0-100

		setoff.vSpeckle_r = 60; // 0-100
		setoff.vSpeckle_g = 60; // 0-100
		setoff.vSpeckle_b = 60; // 0-100

		setoff.vClouds_r = 60; // 0-100
		setoff.vClouds_g = 60; // 0-100
		setoff.vClouds_b = 60; // 0-100

		setoff.vLightColor_r = 60; // 0-100
		setoff.vLightColor_g = 60; // 0-100
		setoff.vLightColor_b = 60; // 0-100

		setoff.vHaze_r = 60; // 0-100
		setoff.vHaze_g = 60; // 0-100
		setoff.vHaze_b = 60; // 0-100

		setoff.fixtures01 = 10; // 0-20
		setoff.fixtures02 = 30; // 0-100
		setoff.fixtures03 = 50; // 0-100
		setoff.fixtures04 = 0; // 0-10
		setoff.fixtures05 = 0; // 0-7
		setoff.fixtures06 = 110; // 0-220
		setoff.fixtures07 = 40; // 0-80
		setoff.fixtures08 = 5; // 0-9
		setoff.fixtures09 = 7; // 0-20

		setoff.vAngle = 0; // 0-60
		setoff.vRotspeed = 0; // 0-20
		`
	5. Galaxy Positions
	>= 0 && <= 1000000000000000 (positions of x, y)
	00 01 02 03 04 05 06 07 [08] 09 10 11 12 13 14 15 16 (positions of z)
	
*/

/* Service Functions and Utility */

// Shows debug message in daemon
Function Info(info_message String) Uint64 

	01 DIM txid as String
	02 LET txid = TXID()

	10  PRINTF "  +-------------------+  " 
	20  PRINTF "  |  `DERO  Galaxy    |  " 
	30  PRINTF "  |                   |  " 
	40  PRINTF "  | %s" info_message
	50  PRINTF "  |                   |  " 
	60  PRINTF "  +-------------------+  " 
	70  PRINTF "  + TXID: %s" txid
	80  PRINTF "  +-------------------+  " 
	
	999 RETURN 0
End Function 


// Register an error, stores it on blockchain
Function Error(error_message String) Uint64 

	01 DIM txid as String
	02 LET txid = TXID()

	10  PRINTF "  +-----[ ERROR ]-----+  " 
	20  PRINTF "  |  `DERO  Galaxy    |  " 
	30  PRINTF "  |                   |  " 
	40  PRINTF "  | %s" error_message
	50  PRINTF "  |                   |  " 
	60  PRINTF "  +-----[ ERROR ]-----+  " 
	70  PRINTF "  + TXID: %s" txid
	80  PRINTF "  +-------------------+  " 
	90 STORE(TXID() + "_error", error_message) // Only for educational purposes, storing error for each tx should be extreemly unreasonable
	
	
	999 RETURN 0
End Function 


// Return value back to signer if error happened
Function ErrorValue(error_message String, value Uint64) Uint64 

	01 DIM signer as String
	02 LET signer = SIGNER()
	03 IF EXISTS(signer + "_credit") == 1 THEN GOTO 05
	04 STORE(signer + "_credit", 0)
	05 STORE(signer + "_credit", LOAD(signer + "_credit") + value)
	
	10  PRINTF "  +-------------------+  " 
	20  PRINTF "  + Refunding: %s" signer
	30  PRINTF "  + With: %d mDERO" value
	40  PRINTF "  +-------------------+  " 
	
	
	999 RETURN Error(error_message)
End Function 


// Redeem error locked funds back
Function ErrorValueWithdraw() Uint64 

	01 DIM signer as String
	02 LET signer = SIGNER()
	03 IF EXISTS(signer + "_credit") == 0 THEN GOTO 999
	04 SEND_DERO_TO_ADDRESS(signer, LOAD(signer + "_credit"))
	05 STORE(signer + "_credit", 0)

	999 RETURN Info("Error Funds Successfully Withdrawn Back")
End Function


// Prevent same block execution (hack)
Function isConcurrentExecution() Uint64

	01 DIM chain_block, user_block, diff as Uint64
	02 LET chain_block = BLOCK_HEIGHT()

	03 IF EXISTS("user_block_" + SIGNER()) == 1 THEN GOTO 05
	04 STORE("user_block_" + SIGNER(), 0)
	
	05 LET user_block = LOAD("user_block_" + SIGNER())
	06 STORE("user_block_" + SIGNER(), chain_block)
	07 LET diff = (chain_block - user_block)
	08 Info("isConcurrentExecution diff = " + diff)
	09 RETURN diff

	
End Function


// Technical function executed on contract deployment
Function Initialize() Uint64
	
	01 STORE("admin", SIGNER()) // store in DB  ["admin"] = address
	
	10 STORE("stats_excelent_cards", 0)
	11 STORE("stats_planet_counter", 0)
	
	12 STORE("variable_colonize_fee", 				2 * 1000000000000) 		// 1 DERO
	13 STORE("variable_sector_moto_fee", 			1 * 500000000000)		// 1 DERO
	14 STORE("variable_dev_fee",							5)						// 5% goes to the dev fee
	15 STORE("variable_redeem_offset",				100) 					// number of blocks between redeems
	16 STORE("variable_redeem_precent",				5)						// formula defined in (CalculateReward)
	17 STORE("variable_enchant_precent",			35)						// percentage of 2nd card stats to be converted into 1st card during echantment process
	
	18 STORE("balance_dev_fee", 0)
	19 STORE("balance_shared_pool", 0)
	
	// 20 AdminSeedSector(1000000000000000/2, 1000000000000000/2)
	
	
	999 RETURN Info("Contract Successfully Deployed")
End Function 


// Donations directly going into dev pool
Function Donate(value Uint64) Uint64

	10 STORE("balance_dev_fee", LOAD("balance_dev_fee") + value)
	
	
	999 RETURN Info("Thank you so much for you donation <3")
End Function


// Stores your correct "DERO" address to fix testnet dETo dERo confusion
Function Authorize() Uint64

	01 STORE("auth_" + TXID(), SIGNER())


	999 RETURN Info("Your Auth Key is: " + TXID())
End Function


// Calculate Redeemable amount for EXCELENT cards
Function CalculateReward() Uint64

	01 DIM reward, cards as Uint64
	02 LET reward = 0
	03 LET cards = LOAD("stats_excelent_cards")
	05 IF cards > 0 THEN GOTO 10
	06 LET cards = 1
	
	10 LET reward = ((LOAD("balance_shared_pool") / (cards + 0) ) * LOAD("variable_redeem_precent")) / 100
	
	20 Info("Current aproax. reward is " + reward)


	999 RETURN reward
End Function


// Calculate total card power
Function CalculateCardPower(planet_position String) Uint64

	01 DIM sum as Uint64
	02 LET sum = 0
	
	10 LET sum = sum + LOAD(planet_position + "/RARECloudiness")
	20 LET sum = sum + LOAD(planet_position + "/RARECold")
	30 LET sum = sum + LOAD(planet_position + "/RAREOcean")
	40 LET sum = sum + LOAD(planet_position + "/RARETemperate")
	50 LET sum = sum + LOAD(planet_position + "/RAREWarm")
	60 LET sum = sum + LOAD(planet_position + "/RAREHot")
	70 LET sum = sum + LOAD(planet_position + "/RARESpeckle")
	80 LET sum = sum + LOAD(planet_position + "/RAREClouds")
	90 LET sum = sum + LOAD(planet_position + "/RARELightColor")
	
	
	999 RETURN sum / 9
End Function


// Store value into dev and reward pool
Function StoreSharedPool(value Uint64) Uint64
	
	01 DIM dev_fee, shared_pool as Uint64
	02 LET dev_fee = (value * LOAD("variable_dev_fee")) / 100
	03 LET shared_pool = value - dev_fee
	
	10 STORE("balance_dev_fee", LOAD("balance_dev_fee") + dev_fee)
	11 STORE("balance_shared_pool", LOAD("balance_shared_pool") + shared_pool)
	
	
	999 RETURN 0
End Function


/* Owner & Administrative Functions */

Function AdminTransferOwnership(new_admin String) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("swap", new_admin)
	21  RETURN 0
	
End Function
	
	
Function AdminClaimOwnership() Uint64 

	10  IF ADDRESS_RAW(LOAD("swap")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("admin", SIGNER()) // ownership claim successful
	21  RETURN 0
	
End Function
	
	
Function AdminWithdraw() Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  SEND_DERO_TO_ADDRESS(SIGNER(), LOAD("balance_dev_fee"))
	21  RETURN 0
	
End Function


Function AdminSetVariable(variable String, new_value Uint64) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  IF EXISTS("variable_" + variable) == 1 THEN GOTO 30
	21 	RETURN 1
	
	30  STORE("variable_" + variable, new_value)
	31  RETURN 0
	
End Function


Function AdminSeedSector(sector_x Uint64, sector_y Uint64) Uint64

	20 PlanetAcquire(sector_x, sector_y, 6, 0)
	21 PlanetAcquire(sector_x, sector_y, 5, 0)
	22 PlanetAcquire(sector_x, sector_y, 4, 0)
	23 PlanetAcquire(sector_x, sector_y, 3, 0)
	24 PlanetAcquire(sector_x, sector_y, 2, 0)
	25 PlanetAcquire(sector_x, sector_y, 1, 0)
	26 PlanetAcquire(sector_x, sector_y, 0, 0)
	
	30 RETURN 0
	
End Function


/* Contract Core Functions */

// Set moto message for galaxy sector
Function SectorSetMoto(sector_x Uint64, sector_y Uint64, moto String, value Uint64) Uint64 

	10 IF value >= LOAD("variable_sector_moto_fee") THEN GOTO 20
	11 RETURN ErrorValue("Unpermited Action. Insufficient `value` attached to transaction.", value)
	12 GOTO 999 // Prevent Execution on same block hack
	
	20 STORE("moto_" + sector_x + ":" + sector_y, moto)


	998 StoreSharedPool(value)
	999 RETURN Info("(SectorSetMoto) Successfully Executed")
End Function


// Set username to be displayed across dApp
Function UserSetAlias(new_name String) Uint64 

	10 STORE(SIGNER() + "_nick", new_name)
	
	
	999 RETURN Info("(UserSetAlias) Successfully Executed")
End Function


// Colonize free slot in sector
Function PlanetAcquire(position_x Uint64, position_y Uint64, position_z Uint64, value Uint64) Uint64
	
	01 IF isConcurrentExecution() != 0 THEN GOTO 10
	02 RETURN 1 // Prevent Execution on same block hack
	
	10 IF value >= LOAD("variable_colonize_fee") THEN GOTO 15
	11 IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 15
	12 RETURN ErrorValue("Unpermited Action. Insufficient `value` attached to transaction.", value)
	13 GOTO 999 // Prevent Execution on same block hack
	
	// Initialize user stack if its his 1st planet
	15 DIM user as String
	16 DIM stack_index as Uint64
	17 LET user = SIGNER()
	18 LET stack_index = 0
	
	20 IF EXISTS(user + "_index") == 1 THEN GOTO 30
	21 STORE(user + "_index", stack_index)
	
	30 LET stack_index = LOAD(user + "_index")
	
	40 DIM planet_position as String
	41 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z
	42 DIM stats_planet_counter, stats_excelent_cards as Uint64
	43 LET stats_planet_counter = LOAD("stats_planet_counter")
	44 LET stats_excelent_cards = LOAD("stats_excelent_cards")
	
	// Check if slot is free
	50 IF EXISTS(planet_position + "/Owner") == 0 THEN GOTO 60
	51 IF LOAD(planet_position + "/Owner") == "" THEN GOTO 60
	52 RETURN ErrorValue("Unpermited Action. Planet slot is already occupied.", value)
	53 GOTO 999 // Prevent Execution on same block hack
	
	// All checkup passed now we can generate planet
	
	60 PRINTF " --- Start Generation --- "
	
	65 DIM max_random as Uint64
	66 LET max_random = 10 + RANDOM(90 + 1)
	
	// Random Description
	94  STORE(planet_position + "/Mass", 					100 + RANDOM(1000))
	95  STORE(planet_position + "/Population", 		1000000 + RANDOM(10000000000))
	96  STORE(planet_position + "/AvgTemp", 			RANDOM(200))
	
	// Editable Data
	97  STORE(planet_position + "/OnSale", 				0)
	98  STORE(planet_position + "/Name", 					"")
	99  STORE(planet_position + "/Moto", 					"")
	100 STORE(planet_position + "/Owner", 				user)
	
	// Card Power Attributes
	101 STORE(planet_position + "/RARECloudiness",  0 + RANDOM(max_random + 1) )
	102 STORE(planet_position + "/RARECold", 				0 + RANDOM(max_random + 1) )
	103 STORE(planet_position + "/RAREOcean", 			0 + RANDOM(max_random + 1) )
	104 STORE(planet_position + "/RARETemperate", 	0 + RANDOM(max_random + 1) )
	105 STORE(planet_position + "/RAREWarm", 				0 + RANDOM(max_random + 1) )
	106 STORE(planet_position + "/RAREHot", 				0 + RANDOM(max_random + 1) )
	107 STORE(planet_position + "/RARESpeckle", 		0 + RANDOM(max_random + 1) )
	108 STORE(planet_position + "/RAREClouds", 			0 + RANDOM(max_random + 1) )
	109 STORE(planet_position + "/RARELightColor", 	0 + RANDOM(max_random + 1) )
	
	// Uniq Characteristics
	110 STORE(planet_position + "/vWaterLevel", 		0 + RANDOM( 40 + 1) )
	111 STORE(planet_position + "/vRivers", 				0 + RANDOM(100 + 1) )
	112 STORE(planet_position + "/vTemperature", 		0 + RANDOM( 40 + 1) )
	113 STORE(planet_position + "/vCloudiness", 		0 + RANDOM( 20 + 1) )
	
	114 STORE(planet_position + "/vCold_r", 		0 + RANDOM(100 + 1) )
	115 STORE(planet_position + "/vCold_g", 		0 + RANDOM(100 + 1) )
	116 STORE(planet_position + "/vCold_b", 		0 + RANDOM(100 + 1) )
	
	117 STORE(planet_position + "/vOcean_r", 		0 + RANDOM(100 + 1) )
	118 STORE(planet_position + "/vOcean_g", 		0 + RANDOM(100 + 1) )
	119 STORE(planet_position + "/vOcean_b", 		0 + RANDOM(100 + 1) )
	
	120 STORE(planet_position + "/vTemperate_r", 	0 + RANDOM(100 + 1) )
	121 STORE(planet_position + "/vTemperate_g", 	0 + RANDOM(100 + 1) )
	122 STORE(planet_position + "/vTemperate_b", 	0 + RANDOM(100 + 1) )
	
	123 STORE(planet_position + "/vWarm_r", 		0 + RANDOM(100 + 1) )
	124 STORE(planet_position + "/vWarm_g", 		0 + RANDOM(100 + 1) )
	125 STORE(planet_position + "/vWarm_b", 		0 + RANDOM(100 + 1) )
	
	126 STORE(planet_position + "/vHot_r", 			0 + RANDOM(100 + 1) )
	127 STORE(planet_position + "/vHot_g", 			0 + RANDOM(100 + 1) )
	128 STORE(planet_position + "/vHot_b", 			0 + RANDOM(100 + 1) )
	
	129 STORE(planet_position + "/vSpeckle_r", 		0 + RANDOM(100 + 1) )
	130 STORE(planet_position + "/vSpeckle_g", 		0 + RANDOM(100 + 1) )
	131 STORE(planet_position + "/vSpeckle_b", 		0 + RANDOM(100 + 1) )
		
	132 STORE(planet_position + "/vClouds_r", 		0 + RANDOM(100 + 1) )
	133 STORE(planet_position + "/vClouds_g", 		0 + RANDOM(100 + 1) )
	134 STORE(planet_position + "/vClouds_b", 		0 + RANDOM(100 + 1) )
	
	135 STORE(planet_position + "/vLightColor_r", 	0 + RANDOM(100 + 1) )
	136 STORE(planet_position + "/vLightColor_g", 	0 + RANDOM(100 + 1) )
	137 STORE(planet_position + "/vLightColor_b", 	0 + RANDOM(100 + 1) )
	
	138 STORE(planet_position + "/vHaze_r", 		0 + RANDOM(100 + 1) )
	139 STORE(planet_position + "/vHaze_g", 		0 + RANDOM(100 + 1) )
	140 STORE(planet_position + "/vHaze_b", 		0 + RANDOM(100 + 1) )
	
	141 STORE(planet_position + "/fixtures01",  	0 + RANDOM( 20 + 1) )
	142 STORE(planet_position + "/fixtures02", 		0 + RANDOM(100 + 1) )
	143 STORE(planet_position + "/fixtures03", 		0 + RANDOM(100 + 1) )
	144 STORE(planet_position + "/fixtures04", 		0 + RANDOM( 10 + 1) )
	145 STORE(planet_position + "/fixtures05", 		0 + RANDOM(  7 + 1) )
	146 STORE(planet_position + "/fixtures06", 		0 + RANDOM(220 + 1) )
	147 STORE(planet_position + "/fixtures07", 		0 + RANDOM( 80 + 1) )
	148 STORE(planet_position + "/fixtures08", 		0 + RANDOM(  9 + 1) )
	149 STORE(planet_position + "/fixtures09", 		0 + RANDOM( 20 + 1) )
	
	150 STORE(planet_position + "/vAngle", 				0 + RANDOM( 60 + 1) )
	151 STORE(planet_position + "/vRotspeed", 		0 + RANDOM( 20 + 1) )
	
	// Technical Data
	152 STORE(planet_position + "/txid", 					TXID() )
	153 STORE(planet_position + "/planet_position", planet_position )
	154 STORE(planet_position + "/card_power", 		CalculateCardPower(planet_position) )
	155 STORE(planet_position + "/created_at", 		BLOCK_HEIGHT() )
	156 STORE(planet_position + "/next_redeem_at", 	0 )
	
	// Increase excelent card count if its card power more then 95%
	180 IF LOAD(planet_position + "/card_power") < 95 THEN GOTO 200
	181 STORE("stats_excelent_cards", stats_excelent_cards + 1)
	
	200 STORE(user+"_index_"+stack_index, planet_position)
	201 STORE(user+"_index", stack_index + 1)
	
	202 STORE("stats_planet_counter", stats_planet_counter + 1)
	
	
	998 StoreSharedPool(value)
	999 RETURN Info("(PlanetAcquire) Successfully Executed")
End Function


// Sacrificing one card to use it attributes (percentage) to enchance another card
Function PlanetMerge(planet1_x Uint64, planet1_y Uint64, planet1_z Uint64, planet2_x Uint64, planet2_y Uint64, planet2_z Uint64) Uint64

	01 IF isConcurrentExecution() != 0 THEN GOTO 10
	02 RETURN 1 // Prevent Execution on same block hack

	10 DIM planet1_position, planet2_position as String
	11 LET planet1_position = "" + planet1_x + ":" + planet1_y + ":" + planet1_z
	12 LET planet2_position = "" + planet2_x + ":" + planet2_y + ":" + planet2_z

	// Planet 1 Exists
	13 IF EXISTS(planet1_position + "/Owner") == 1 THEN GOTO 20
	14 RETURN Error("Unpermited Action. Planet 1 does not exist.")
	15 GOTO 999 // Prevent Execution on same block hack
		
	// Planet 1 Belongs To Signer
	20 IF ADDRESS_RAW(LOAD(planet1_position + "/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet 1 does not belong to you.")
	22 GOTO 999 // Prevent Execution on same block hack

	// Planet 2 Exists
	30 IF EXISTS(planet2_position + "/Owner") == 1 THEN GOTO 40
	31 RETURN Error("Unpermited Action. Planet 2 does not exist.")
	32 GOTO 999 // Prevent Execution on same block hack
	
	// Planet 2 Belongs To Signer
	40 IF ADDRESS_RAW(LOAD(planet2_position + "/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 50
	41 RETURN Error("Unpermited Action. Planet 2 does not belong to you.")
	42 GOTO 999 // Prevent Execution on same block hack

	50 PRINTF " --- "

	51 DIM variable_enchant_precent as Uint64
	52 LET variable_enchant_precent = LOAD("variable_enchant_precent")
	53 DIM stats_planet_counter, stats_excelent_cards as Uint64
	54 LET stats_planet_counter = LOAD("stats_planet_counter")
	55 LET stats_excelent_cards = LOAD("stats_excelent_cards")
	56 DIM attr as String
	
	// Incrust new stats into 1st card
	60 LET attr = "/RARECloudiness"
	61 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	62 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 70
	63 STORE(planet1_position + attr, 100)
	
	70 LET attr = "/RARECold"
	71 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	72 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 80
	73 STORE(planet1_position + attr, 100)
	
	80 LET attr = "/RAREOcean"
	81 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	82 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 90
	83 STORE(planet1_position + attr, 100)
	
	90 LET attr = "/RARETemperate"
	91 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	92 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 100
	93 STORE(planet1_position + attr, 100)
	
	100 LET attr = "/RAREWarm"
	101 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	102 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 110
	103 STORE(planet1_position + attr, 100)
	
	110 LET attr = "/RAREHot"
	111 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	112 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 120
	113 STORE(planet1_position + attr, 100)
	
	120 LET attr = "/RARESpeckle"
	121 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	122 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 130
	123 STORE(planet1_position + attr, 100)
	
	130 LET attr = "/RAREClouds"
	131 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	132 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 140
	133 STORE(planet1_position + attr, 100)
	
	140 LET attr = "/RARELightColor"
	141 STORE(planet1_position + attr, LOAD(planet1_position + attr) + ((LOAD(planet2_position + attr) * variable_enchant_precent) / 100))
	142 IF LOAD(planet1_position + attr) <= 100 THEN GOTO 150
	143 STORE(planet1_position + attr, 100)
	
	150 DIM card_power1, card_power2 as Uint64
	151 LET card_power1 = CalculateCardPower(planet1_position)
	152 LET card_power2 = CalculateCardPower(planet2_position)
	
	// Set newly calculated card power
	190 STORE(planet1_position + "/card_power", card_power1)
	
	// Increase excelent card count if its card power more then 95%
	191 IF card_power1 < 95 THEN GOTO 200
	192 STORE("stats_excelent_cards", stats_excelent_cards + 1)
	
	// Erase 2nd card
	200 STORE(planet2_position + "/Owner", "")
	201 IF stats_planet_counter == 0 THEN GOTO 205
	202 STORE("stats_planet_counter", stats_planet_counter - 1)
	
	// Remove absolutes count if EXCELENT card has been burnt
	205 IF card_power2 < 95 THEN GOTO 999
	206 STORE("stats_excelent_cards", stats_excelent_cards - 1)
	
	
	999 RETURN Info("(PlanetMerge) Successfully Executed")
End Function


// Overwrite current planet name and description
Function PlanetSetDesc(position_x Uint64, position_y Uint64, position_z Uint64, name String, moto String) Uint64

	01 DIM planet_position as String
	02 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z

	10 IF EXISTS(planet_position+"/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	12 GOTO 999 // Prevent Execution on same block hack
	
	20 IF ADDRESS_RAW(LOAD(planet_position+"/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	22 GOTO 999 // Prevent Execution on same block hack
	
	30 PRINTF " --- "
	
	100 STORE(planet_position+"/Name", name)
	101 STORE(planet_position+"/Moto", moto)

	
	999 RETURN Info("(PlanetSetDesc) Successfully Executed")
End Function


// Puts planet on sale, so anyone can buy it from you
Function PlanetSellOut(position_x Uint64, position_y Uint64, position_z Uint64, price Uint64) Uint64

	01 DIM planet_position as String
	02 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z

	10 IF EXISTS(planet_position + "/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	12 GOTO 999 // Prevent Execution on same block hack
	
	20 IF ADDRESS_RAW(LOAD(planet_position + "/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	22 GOTO 999 // Prevent Execution on same block hack
	
	30 PRINTF " --- "

	100 STORE(planet_position + "/OnSale", price)

	
	999 RETURN Info("(PlanetSellOut) Successfully Executed")
End Function


// Acquire planet wich is set on sale
Function PlanetBuyIn(position_x Uint64, position_y Uint64, position_z Uint64, value Uint64) Uint64

	01 DIM planet_position as String
	02 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z

	10 IF EXISTS(planet_position + "/Owner") == 1 THEN GOTO 20
	11 RETURN ErrorValue("Unpermited Action. Planet does not exist.", value)
	12 GOTO 999 // Prevent Execution on same block hack
	
	20 IF ADDRESS_RAW(LOAD(planet_position + "/Owner")) != ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet already belongs to you.")
	22 GOTO 999 // Prevent Execution on same block hack
	
	30 IF value > 0 THEN GOTO 40 // To bypass 0 OnSale value, wich corresponds to not being set on sale
	31 RETURN Error("Unpermited Action. Value should be more then 0.")
	32 GOTO 999 // Prevent Execution on same block hack
	
	40 IF( value >= LOAD(planet_position + "/OnSale") ) THEN GOTO 50
	41 RETURN ErrorValue("Unpermited Action. Card price is higher then you`ve payed.", value)
	42 GOTO 999 // Prevent Execution on same block hack
	
	50 PRINTF " --- "

	// Add into new owner stack list
	60 LET new_owner = SIGNER()
	61 LET new_owner_stack_index = 0
	62 IF EXISTS(new_owner + "_index") == 1 THEN GOTO 54
	63 STORE(new_owner + "_index", new_owner_stack_index)
	64 LET new_owner_stack_index = LOAD(new_owner + "_index")
	
	// Setting new owner for planet
 	70 STORE(new_owner + "_index_" + new_owner_stack_index, planet_position)
	71 STORE(new_owner + "_index", stack_index + 1)
	
	100 STORE(planet_position + "/Owner", new_owner)
	101 STORE(planet_position + "/OnSale", 0)


	999 RETURN Info("(PlanetSellOut) Successfully Executed")
End Function


// Redeem `daily` reward from your EXCELENT card
Function PlanetRedeem(position_x Uint64, position_y Uint64, position_z Uint64) Uint64

	01 IF isConcurrentExecution() != 0 THEN GOTO 10
	02 RETURN 1 // Prevent Execution on same block hack

	10 DIM planet_position as String
	11 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z

	// Planet exists
	12 IF EXISTS(planet_position + "/Owner") == 1 THEN GOTO 20
	13 RETURN Error("Unpermited Action. Planet does not exist.")
	14 GOTO 999 // Prevent Execution on same block hack
	
	// Planet is yours
	20 IF ADDRESS_RAW(LOAD(planet_position + "/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	22 GOTO 999 // Prevent Execution on same block hack
	
	// Planet is EXCELENT
	30 IF LOAD(planet_position + "/card_power") >= 95 THEN GOTO 40
	31 RETURN Error("Unpermited Action. Planet is not eliagable for reward.")
	32 GOTO 999 // Prevent Execution on same block hack
	
	// Planet redeemable
	40 IF LOAD(planet_position + "/next_redeem_at") < BLOCK_HEIGHT() THEN GOTO 50
	41 RETURN Error("Unpermited Action. Planet redeem is still recharging.")
	42 GOTO 999 // Prevent Execution on same block hack
	
	50 PRINTF " --- "
	
	60 STORE(planet_position + "/next_redeem_at", BLOCK_HEIGHT() + LOAD("variable_redeem_offset"))

	70 SEND_DERO_TO_ADDRESS(SIGNER(), CalculateReward())
	
	
	999 RETURN Info("(PlanetRedeem) Successfully Executed")
End Function
