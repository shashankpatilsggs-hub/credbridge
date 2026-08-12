#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Address, Env, String};

#[contract]
pub struct CredBridgeContract;

#[contractimpl]
impl CredBridgeContract {
    /// Store a zero-knowledge reputation proof hash for a user on Stellar Testnet
    pub fn store_proof(env: Env, user: Address, proof_hash: String, category: String) -> bool {
        user.require_auth();
        
        let key = (symbol_short!("proof"), user.clone());
        env.storage().instance().set(&key, &proof_hash);
        
        // Publish on-chain Soroban event
        env.events().publish((symbol_short!("cred"), symbol_short!("stored")), (user, proof_hash, category));
        true
    }

    /// Retrieve verified reputation proof hash for a user address
    pub fn get_proof(env: Env, user: Address) -> String {
        let key = (symbol_short!("proof"), user);
        env.storage().instance().get(&key).unwrap_or(String::from_str(&env, ""))
    }
}
