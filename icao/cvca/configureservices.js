/**
 *  ---------
 * |.##> <##.|  Open Smart Card Development Platform (www.openscdp.org)
 * |#       #|  
 * |#       #|  Copyright (c) 1999-2010 CardContact Software & System Consulting
 * |'##> <##'|  Andreas Schwier, 32429 Minden, Germany (www.cardcontact.de)
 *  --------- 
 *
 *  This file is part of OpenSCDP.
 *
 *  OpenSCDP is free software; you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License version 2 as
 *  published by the Free Software Foundation.
 *
 *  OpenSCDP is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with OpenSCDP; if not, write to the Free Software
 *  Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 * 
 * @fileoverview Configure services
 */

// --- Global settings ---

// The base URL at which services respond to webservice requests
var url = "http://localhost:8080";
// var url = "https://localhost:8443";

// The data directory for keys, requests, certificates and configurations
var datadir = "c:/data/eacpki";



var bookmarkservicelist = ["CVCA", "DVCA", "TCC", "VT"];

function createBookmarks(ui, myself)  {
	for (var i = 0; i < bookmarkservicelist.length; i++) {
		var sn = bookmarkservicelist[i];
		var bm = myself == sn ? ">" + sn : sn;
		ui.addBookmark(bm, "http://localhost:8080/se/" + sn.toLowerCase());
	}
}



// --- CVCA section ---

// Create an CVCA service
var cvca = new CVCAService(datadir +  "/cvca", "UTCVCA");

// The policy used to issue self-signed root certificates
var rootPolicy = { certificateValidityDays: 6,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("E3", HEX),
				   includeDomainParameter: true,
				   shellModelForExpirationDate: false,
				   extensions: null
				 };

cvca.setRootCertificatePolicy(rootPolicy);

// The policy used to issue link certificates
var linkPolicy = { certificateValidityDays: 6,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("E3", HEX),
				   includeDomainParameter: true,
				   shellModelForExpirationDate: false,
				   extensions: null
				 };

cvca.setLinkCertificatePolicy(linkPolicy);

// The policy used to issue DV certificates
var dVPolicy = { certificateValidityDays: 4,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("A3", HEX),
				   includeDomainParameter: false,
				   shellModelForExpirationDate: true,
				   extensions: null,
				   authenticatedRequestsApproved: false,
				   initialRequestsApproved: false,
				   declineExpiredAuthenticatedRequest: true
				 };

// Default policy
cvca.setDVCertificatePolicy(dVPolicy);

var dVPolicy = { certificateValidityDays: 4,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("A3", HEX),
				   includeDomainParameter: false,
				   shellModelForExpirationDate: true,
				   extensions: null,
				   authenticatedRequestsApproved: true,
				   initialRequestsApproved: false,
				   declineExpiredAuthenticatedRequest: true
				 };

// Policy for UTDVCA
cvca.setDVCertificatePolicy(dVPolicy, /^UTDVCA.*$/);


/*
// Set signature key specification
var key = new Key();
key.setComponent(Key.ECC_CURVE_OID, new ByteString("brainpoolP384t1", OID));
cvca.setKeySpec(key, new ByteString("id-TA-ECDSA-SHA-384", OID));
*/


// Create GUI
var cvcaui = new CVCAUI(cvca);
createBookmarks(cvcaui, "CVCA");

SOAPServer.registerService("cvca", cvca, cvcaui);



// --- DVCA section ---

// Create a DVCA service

var dvca = new DVCAService(datadir + "/dvca", "UTDVCA", "UTCVCA", url + "/se/cvca");
// var dvca = new DVCAService(datadir + "/dvca", "UTDVCA", "UTCVCA");
dvca.setSendCertificateURL(url + "/se/dvca");

var terminalPolicy = { certificateValidityDays: 6,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("23", HEX),
				   includeDomainParameter: false,
				   shellModelForExpirationDate: true,
				   extensions: null,
				   authenticatedRequestsApproved: true,
				   initialRequestsApproved: false,
				   declineExpiredAuthenticatedRequest: true
				 };

dvca.setTerminalCertificatePolicy(terminalPolicy);

var terminalPolicyVT = { certificateValidityDays: 6,
				   chatRoleOID: new ByteString("id-IS", OID),
				   chatRights: new ByteString("23", HEX),
				   includeDomainParameter: false,
				   shellModelForExpirationDate: true,
				   extensions: null,
				   authenticatedRequestsApproved: true,
				   initialRequestsApproved: true,
				   declineExpiredAuthenticatedRequest: true
				 };

dvca.setTerminalCertificatePolicy(terminalPolicyVT, /UTVT/);

// Create GUI
var dvcaui = new DVCAUI(dvca);
createBookmarks(dvcaui, "DVCA");

SOAPServer.registerService("dvca", dvca, dvcaui);



// --- TCC section ---

// Create TCC service
var tcc = new TCCService(datadir + "/tcc", "/UTCVCA/UTDVCA/UTTERM", url + "/se/dvca");
tcc.setSendCertificateURL(url + "/se/tcc");

// Create GUI
var tccui = new TCCUI(tcc);
createBookmarks(tccui, "TCC");

SOAPServer.registerService("tcc", tcc, tccui);



// --- VTerm section ---

// Create a virtual terminal service
var vt = new VTermService(datadir + "/vt", "/UTCVCA/UTDVCA", url + "/se/dvca");
vt.setSendCertificateURL(url + "/se/vt");

// Create GUI
var vtui = new VTermUI(vt);
createBookmarks(vtui, "VT");

SOAPServer.registerService("vt", vt, vtui);