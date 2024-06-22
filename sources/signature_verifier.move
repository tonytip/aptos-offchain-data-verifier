module deployer::signature_verifier {
    use std::signer;
    use std::vector;
    use std::error;
    use std::hash;
    use std::bcs::to_bytes;
    use std::timestamp;

    use aptos_std::secp256k1::{
        ecdsa_recover,
        ecdsa_signature_from_bytes,
        ecdsa_raw_public_key_from_64_bytes
    };

    const E_NOT_AUTHORIZED: u64 = 100;
    const E_INVALID_PUBLIC_KEY: u64 = 201;
    const E_INVALID_SIGNATURE: u64 = 202;
    const E_TIMESTAMP_EXPIRED: u64 = 203;

    const EXPIRED_TIME: u64 = 120; // 2 minutes

    struct Message has copy, drop {
        func: vector<u8>,
        addr: address,
        data: u64,
        ts: u64
    }

    struct Manager has key, store {
        admin_addr: address,
        pk: vector<u8>,
    }

    fun init_module(deployer: &signer) {

        move_to(deployer, Manager { admin_addr: @deployer, pk: vector::empty<u8>() });
    }

    public entry fun set_pk(admin: &signer, pk: vector<u8>) acquires Manager {
        let admin_addr = signer::address_of(admin);
        let resource = borrow_global_mut<Manager>(@deployer);
        assert!(resource.admin_addr == admin_addr,
            error::permission_denied(E_NOT_AUTHORIZED));
        assert!(vector::length(&pk) == 64, error::invalid_argument(E_INVALID_PUBLIC_KEY));

        resource.pk = pk;
    }

    public entry fun verify_data(player: &signer, data: u64, ts: u64, rec_id: u8, signature: vector<u8>) acquires Manager {
        let player_addr = signer::address_of(player);

        let now = timestamp::now_seconds();
        assert!(now >= ts && now - ts <= EXPIRED_TIME,
            error::invalid_argument(E_TIMESTAMP_EXPIRED));
        let message: Message = Message { func: b"verify_data", addr: player_addr, data: data, ts: ts };
        let msg_bytes = to_bytes(&message);

        let pk = ecdsa_recover(hash::sha2_256(msg_bytes), rec_id, &ecdsa_signature_from_bytes(
                signature
            ),);

        assert!(std::option::is_some(&pk), error::invalid_argument(E_INVALID_SIGNATURE));

        let resource = borrow_global<Manager>(@deployer);
        let ecdsaRawPk = std::option::extract(&mut pk);

        assert!(&ecdsaRawPk == &ecdsa_raw_public_key_from_64_bytes(resource.pk),
            error::invalid_argument(E_INVALID_SIGNATURE));

    }
}
