/*

	`Boundless Galaxy` @plrspro
	
	General notes:
	none

*/

/*

	Technical notes:
	1. The UInt64 value type represents unsigned integers with values ranging from 0 to 18,446,744,073,709,551,615. 
	2. Galaxy limitations obstructed for simplicity equalst to values ranging from 0 to 1 000 000 000 000 000 (due to js MAX_INT_VALUE)
	3. 1 DERO = 1000000000000 value
*/

/* Service Functions and Utility */

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
	
	999 RETURN 1
End Function 


Function Initialize() Uint64
	
	// Galaxy center is
	
	10 STORE("admin", SIGNER()) // store in DB  ["owner"] = address
	
	11 STORE("stats_planet_counter", 0)
	
	12 STORE("variable_colonize_fee", 				1.00 * 1000000000000) 		// 1 DERO
	13 STORE("variable_sector_moto_fee", 			0.50 * 1000000000000)		// 1 DERO
	14 STORE("variable_nickname_fee", 				0.025 * 1000000000000)	 	// 1 DERO
	15 STORE("variable_emperor_discount_per_topo",	(1000000000000 / 2) * 7200) // ~7200 blocks(topos) per day = (1000000000000 / 2) * 7200) half a dero per day
	16 STORE("variable_dev_fee",					5)							// 5% goes to the dev fee
	
	14 STORE("galaxy_center", "" + (1000000000000000/2) + ":" + (1000000000000000/2))
	
	16 STORE("emperor_bid", 0)
	16 STORE("emperor_last_check_topo", 0)
	17 STORE("emperor_user", "")
	
	18 STORE("balance_dev_fee", 0)
	19 STORE("balance_shared_pool", 0)
	
	20 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 0)
	21 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 1)
	22 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 2)
	23 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 3)
	24 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 4)
	25 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 5)
	26 PlanetAcquire(1000000000000000/2, 1000000000000000/2, 6)
	
	27 PlanetAcquire(1000000000000000/2-1, 1000000000000000/2, 5)
	28 PlanetAcquire(1000000000000000/2-1, 1000000000000000/2, 6)
	
	999 RETURN Info("Contract Successfully Deployed")
End Function 


Function CalculateCardPower(planet_position String) Uint64

	DIM sum as Uint64
	LET sum = 0
	
	10 sum = sum + LOAD(planet_position + "/RARECloudiness")
	20 sum = sum + LOAD(planet_position + "/RARECold")
	30 sum = sum + LOAD(planet_position + "/RAREOcean")
	40 sum = sum + LOAD(planet_position + "/RARETemperate")
	50 sum = sum + LOAD(planet_position + "/RAREWarm")
	60 sum = sum + LOAD(planet_position + "/RAREHot")
	70 sum = sum + LOAD(planet_position + "/RARESpeckle")
	80 sum = sum + LOAD(planet_position + "/RAREClouds")
	90 sum = sum + LOAD(planet_position + "/RARELightColor")
	
	RETURN sum

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
	
	20  SEND_DERO_TO_ADDRESS(SIGNER(), LOAD('balance_dev_fee'))
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

/* Contract Core Functions */

Function GalaxyEmperorReset() Uint64 

	//If current block higher then offset relese current galaxy emperor and reset back to 0:0
	// TODO
	
	999 RETURN Info("(GalaxyEmperorReset) Successfully Executed")
End Function


Function GalaxyEmperorOverbid() Uint64 

	01 GalaxyEmperorReset(); // Reset Galaxy Emperror State
	

	999 RETURN Info("(GalaxyEmperorOverbid) Successfully Executed")
End Function


Function SectorSetMoto() Uint64 


	999 RETURN Info("(SectorSetMoto) Successfully Executed")
End Function


Function UserSetAlias(new_name String) Uint64 

	
	999 RETURN Info("(UserSetAlias) Successfully Executed")
End Function


Function PlanetAcquire(position_x Uint64, position_y Uint64, position_z Uint64) Uint64

	01 GalaxyEmperorReset(); // Reset Galaxy Emperror State

	// >= 0 && <= 1000000000000000 (positions of x, y)
	// 00 01 02 03 04 05 06 07 [08] 09 10 11 12 13 14 15 16 (positions of z)
	
	// Initialize user stack if its his 1st platform
	10 DIM user as String
	11 DIM stack_index as Uint64
	12 LET user = SIGNER()
	13 LET stack_index = 0
	
	20 IF EXISTS(user+"_index") == 1 THEN GOTO 30
	21 STORE(user+"_index", stack_index)
	
	30 LET stack_index = LOAD(user+"_index")
	
	/*
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
	*/
	
	40 DIM planet_position as String
	41 LET planet_position = "" + position_x + ":" + position_y + ":" + position_z
	
	// Check if slot is free
	50 IF EXISTS(planet_position + "/Owner") == 0 THEN GOTO 60
	51 IF LOAD(planet_position + "/Owner") == "" THEN GOTO 60
	52 RETURN 1
	
	// All checkup passed now we can generate planet
	
	60 PRINTF " --- Start Generation --- "
	
	94  STORE(planet_position + "/Mass", 			100 + RANDOM(1000))
	95  STORE(planet_position + "/Population", 		1000000 + RANDOM(10000000000))
	96  STORE(planet_position + "/AvgTemp", 		RANDOM(200))
	
	97  STORE(planet_position + "/OnSale", 			0)
	98  STORE(planet_position + "/Name", 			"")
	99  STORE(planet_position + "/Moto", 			"")
	100 STORE(planet_position + "/Owner", 			user)
	
	101 STORE(planet_position + "/RARECloudiness",  0 + RANDOM(100 + 1) )
	102 STORE(planet_position + "/RARECold", 		0 + RANDOM(100 + 1) )
	103 STORE(planet_position + "/RAREOcean", 		0 + RANDOM(100 + 1) )
	104 STORE(planet_position + "/RARETemperate", 	0 + RANDOM(100 + 1) )
	105 STORE(planet_position + "/RAREWarm", 		0 + RANDOM(100 + 1) )
	106 STORE(planet_position + "/RAREHot", 		0 + RANDOM(100 + 1) )
	107 STORE(planet_position + "/RARESpeckle", 	0 + RANDOM(100 + 1) )
	108 STORE(planet_position + "/RAREClouds", 		0 + RANDOM(100 + 1) )
	109 STORE(planet_position + "/RARELightColor", 	0 + RANDOM(100 + 1) )
	
	110 STORE(planet_position + "/vWaterLevel", 	0 + RANDOM( 40 + 1) )
	111 STORE(planet_position + "/vRivers", 		0 + RANDOM(100 + 1) )
	112 STORE(planet_position + "/vTemperature", 	0 + RANDOM( 40 + 1) )
	113 STORE(planet_position + "/vCloudiness", 	0 + RANDOM( 20 + 1) )
	
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
	
	150 STORE(planet_position + "/vAngle", 			0 + RANDOM( 60 + 1) )
	151 STORE(planet_position + "/vRotspeed", 		0 + RANDOM( 20 + 1) )
	
	// 152 STORE(planet_position + "/index_in_stack", 	stack_index )
	152 STORE(planet_position + "/txid", 			TXID() )
	153 STORE(planet_position + "/planet_position", planet_position )
	154 STORE(planet_position + "/card_power", 		CalculateCardPower(planet_position) )
	
	200 STORE(user+"_index_"+stack_index, planet_position)
	201 STORE(user+"_index", stack_index + 1)
	
	202 STORE("stats_planet_counter", LOAD("stats_planet_counter") + 1)
	
	
	999 RETURN Info("(PlanetAcquire) Successfully Executed")
End Function

/*
Function PlanetMerge(planet1_x Uint64, planet1_y Uint64, planet1_z Uint64, planet2_x Uint64, planet2_y Uint64, planet2_z Uint64)

	01 GalaxyEmperorReset(); // Reset Galaxy Emperror State

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"]/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	
	20 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"]/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	
	30 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"]/Owner") == 1 THEN GOTO 40
	31 RETURN Error("Unpermited Action. Planet does not exist.")
	
	40 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"]/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 50
	41 RETURN Error("Unpermited Action. Planet does not belong to you.")

	50 PRINTF " --- "
	
	40 DIM planet1_position, planet2_position as String
	41 LET planet1_position = "" + planet1_x + ":" + planet1_y + ":" + planet1_z
	42 LET planet2_position = "" + planet2_x + ":" + planet2_y + ":" + planet2_z
	
	100 STORE(planet2_position + "/Owner", "")
	202 STORE("stats_planet_counter", LOAD("stats_planet_counter") - 1)
	
	999 RETURN Info("(PlanetMerge) Successfully Executed")
End Function


Function PlanetSetDesc(position_x Uint64, position_y Uint64, position_z Uint64, name String, moto String) Uint64

	01 GalaxyEmperorReset(); // Reset Galaxy Emperror State

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"]/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	
	20 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"]/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	
	30 PRINTF " --- "
	
	100 STORE("["+position_x+":"+position_y+":"+position_z+"]/Name", name)
	101 STORE("["+position_x+":"+position_y+":"+position_z+"]/Moto", moto)

	
	999 RETURN Info("(PlanetSetDesc) Successfully Executed")
End Function


Function PlanetSellOut(position_x Uint64, position_y Uint64, position_z Uint64, price Uint64) Uint64

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"]/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	
	20 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"]/Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO 30
	21 RETURN Error("Unpermited Action. Planet does not belong to you.")
	
	30 PRINTF " --- "

	100 STORE("["+position_x+":"+position_y+":"+position_z+"]/OnSell", price)

	
	999 RETURN Info("(PlanetSellOut) Successfully Executed")
End Function


Function PlanetBuyIn(position_x Uint64, position_y Uint64, position_z Uint64, value Uint64) Uint64

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"]/Owner") == 1 THEN GOTO 20
	11 RETURN Error("Unpermited Action. Planet does not exist.")
	
	20 IF value > 0 THEN GOTO 30 // To bypass 0 OnSell value, wich corresponds to not being set on sale
	21 RETURN Error("Unpermited Action. Value should be positive.")
	
	30 IF( value >= LOAD("["+position_x+":"+position_y+":"+position_z+"]/OnSell") ) THEN GOTO 40
	31 RETURN Error("Unpermited Action. Card price is higher then youve payed.")
	
	40 PRINTF " --- "

	100 STORE("["+position_x+":"+position_y+":"+position_z+"]/Owner", SIGNER())
	101 STORE("["+position_x+":"+position_y+":"+position_z+"]/OnSell", 0)
	
	// TODO: Find and remove card from previous owner stack list
	
	
	999 RETURN Info("(PlanetSellOut) Successfully Executed")
End Function
*/
