<h2>super simple ethereum -> http bridge for fetching contract info</h2>
<p>powered by etherscan for ABIs and cloudflare for ethereum endpoints<p>

### 🚀 use it at <a href="https://ether.actor">ether.actor</a>

<p>try it:</p>

<ul>
<li><a href="https://ether.actor/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63">/0xcontract</a><br />
returns the ABI of the given contract</li>

<li><a href="https://ether.actor/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenURI/23">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call</li>

<li><a href="https://ether.actor/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/tokenSvgDataOf/233">/0xcontract/methodName/arg0</a><br />
returns the result of the given function call (works for media too)</li>

<li><a href="https://ether.actor/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0x18C8dF1fb7FB44549F90d1C2BB1DC8b690CD0559/0x18C2dF1fb7FB44549F90d1C2BB1DC8b690CD0559">/0x8d04a8c79ceb0889bdd12acdf3fa9d207ed3ff63/isApprovedForAll/0xADDRESS0/0xADDRESS1</a>
<br />works with booleans and multiple arguments.
</ul>

