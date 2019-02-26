/*

	`Boundless Galaxy`
	
	General notes:
	none

*/

/*

	Technical notes:
	1. The UInt64 value type represents unsigned integers with values ranging from 0 to 18,446,744,073,709,551,615. 
	2. Galaxy limitations obstructed for simplicity equalst to values ranging from 0 to 10 000 000 000 000 000 000

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
	
	10 STORE("admin", SIGNER())   // store in DB  ["owner"] = address
	
	10 PlanetAcquire(10000000000000000000/2, 10000000000000000000/2, 8)
	
	999 RETURN Info("Contract Successfully Deployed")
End Function 


/* Owner & Administrative Functions */

Function AdminTransferOwnership(new_admin String) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("swap", new_admin)
	21  RETURN 0
	
End Function
	
	
// until the new owner claims ownership, existing owner remains owner
Function AdminClaimOwnership() Uint64 

	10  IF ADDRESS_RAW(LOAD("swap")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  STORE("admin", SIGNER()) // ownership claim successful
	21  RETURN 0
	
End Function
	
	
// if signer is owner, withdraw any requested funds
// if everthing is okay, thety will be showing in signers wallet
Function AdminWithdraw(amount Uint64) Uint64 

	10  IF ADDRESS_RAW(LOAD("admin")) == ADDRESS_RAW(SIGNER()) THEN GOTO 20 
	11  RETURN 1
	
	20  SEND_DERO_TO_ADDRESS(SIGNER(), amount)
	21  RETURN 0
	
End Function


/* Contract Core Functions */

Function PlanetAcquire(position_x Uint64, position_y Uint64, position_z Uint64) Uint64

	// >= 0 && <= 10000000000000000000 (positions of x, y)
	// 00 01 02 03 04 05 06 07 [08] 09 10 11 12 13 14 15 16 (positions of z)
	
	// Initialize user stack if its his 1st platform
	10 DIM user as String
	11 DIM stack_index as Uint64
	11 LET user = SIGNER()
	11 LET stack_index = 0
	
	10 IF EXISTS(user+"_index") == 1 THEN GOTO 20
	11 STORE(user+"_index", stack_index)
	
	10 stack_index = LOAD(user+"_index")
	
	// All checkup passed now we can generate planet
	100 STORE("["+position_x+":"+position_y+":"+position_z+"] - Owner", SIGNER())
	
	101 STORE("["+position_x+":"+position_y+":"+position_z+"] - Weight", SIGNER())
	102 STORE("["+position_x+":"+position_y+":"+position_z+"] - Radius", SIGNER())
	103 STORE("["+position_x+":"+position_y+":"+position_z+"] - Speed", SIGNER())
	104 STORE("["+position_x+":"+position_y+":"+position_z+"] - Direction", SIGNER())
	
	STORE(user+"_index_"+stack_index, "["+position_x+":"+position_y+":"+position_z+"])
	11 STORE(user+"_index", stack_index+1)
	
	105 RETURN 1
	
End Function


Function PlanetSetNote(position_x Uint64, position_y Uint64, position_z Uint64, note String) Uint64

	10 IF EXISTS("["+position_x+":"+position_y+":"+position_z+"] - Owner") == 1 THEN GOTO 20
	
	
	11 IF ADDRESS_RAW(LOAD("["+position_x+":"+position_y+":"+position_z+"] - Owner")) == ADDRESS_RAW(SIGNER()) THEN GOTO
	
	
	100 STORE("["+position_x+":"+position_y+":"+position_z+"] - Note", note)

End Function


